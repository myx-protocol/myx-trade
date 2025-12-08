import { Box } from '@mui/material'
import { useContext, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getACQuoteLpList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import type { PriceMapType } from '@/request/lp/type.ts'
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
  formatUnits,
  getBalanceOf,
  quote as Quote,
} from '@myx-trade/sdk'
import { SearchContext } from '@/pages/Earn/context.ts'
import { useAccessToken } from '@/hooks/useAccessToken.ts'
import { type Address, PageDirection } from '@/request/type.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { calculationPnl } from '@/utils/pnl.ts'
import { Change } from '@/components/Change'
import { Empty } from '@/components/Empty.tsx'
import { SortField, type Vault } from '../type'
import { Token } from './Token'

export const Positions = ({ className = '' }: { className?: string }) => {
  const navigate = useNavigate()
  const { accessToken } = useAccessToken()
  const { address: account } = useWalletConnection()
  const { chainId, interval } = useContext(SearchContext)
  const [orderBy, setOrderBy] = useState<SortField>(SortField.tvl)
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>(undefined)
  const [before, setBefore] = useState<string | undefined>(undefined)
  const [after, setAfter] = useState<string | undefined>(undefined)

  const { data = { data: [], hasNextPage: false, hasPrevPage: false }, isLoading } = useQuery({
    queryKey: [
      { key: 'quotePositionList' },
      account,
      accessToken,
      chainId,
      interval,
      before,
      after,
      orderBy,
      order,
    ],
    enabled: !!account && !!accessToken,
    queryFn: async () => {
      if (!accessToken || !account) return { data: [], hasNextPage: false, hasPrevPage: false }
      const limit = DEFAULT_LIMIT
      const paginatedLimit = limit + 1
      const sortField =
        orderBy === SortField.deposits || orderBy === SortField.pnl ? SortField.tvl : orderBy
      const result = await getACQuoteLpList(account, accessToken, {
        timeInterval: interval,
        chainId: chainId,
        sortField,
        sortOrder: order,
        limit: paginatedLimit,
        direction: after ? PageDirection.Next : before ? PageDirection.Prev : undefined,
        cursor: after || before,
      })

      let hasNextPage = true
      let hasPrevPage = true
      if (paginatedLimit) {
        const hasNoMoreData = (result.data || []).length < paginatedLimit

        if (!after && !before) {
          hasPrevPage = false
          if (hasNoMoreData) {
            hasNextPage = false
          }
        } else if (after && hasNoMoreData) {
          hasNextPage = false
        } else if (before && hasNoMoreData) {
          hasPrevPage = false
        }
      }
      return {
        data: (limit ? result.data.slice(0, limit) : result.data).map((quote, index) => {
          return {
            name: quote.symbolName,
            symbol: quote.mQuoteBaseSymbol,
            address: quote.baseToken,
            time: quote.tokenCreateTime,
            icon: quote.tokenIcon,
            rating: quote.rating,
            apr: quote.apr,
            tvl: Number(quote?.tvl),
            deposits: '',
            pnl: '',
            chainId: quote.chainId,
            poolId: quote.poolId,
            id: quote.id,
            idx: index,
            quotePoolToken: quote.quotePoolToken,
            avgLpPrice: quote.avgLpPrice,
          } as Vault
        }),
        hasNextPage,
        hasPrevPage,
      }
    },
  })

  const priceQueryParams = useMemo(() => {
    return (data.data || []).map((item) => ({
      poolId: item.poolId,
      chainId: item.chainId,
      idx: item.idx,
      quotePoolToken: item.quotePoolToken,
    }))
  }, [data.data])

  const { data: priceMap } = useQuery({
    queryKey: [{ key: 'getVaultsLpAssetPrice' }, priceQueryParams],
    enabled: !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let _price = ''
          try {
            const rs = await Quote.getLpPrice(item.chainId, item.poolId)
            if (rs) {
              _price = formatUnits(rs, COMMON_PRICE_DECIMALS)
            }
          } catch (_e) {
            console.error(_e)
          }
          return {
            poolId: item.poolId,
            chainId: item.chainId,
            price: _price,
          }
        }),
      )

      const map = (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.price,
        }
      }, {} as PriceMapType)
      return map
    },
    refetchInterval: 5000,
  })

  const { data: depositMap } = useQuery({
    queryKey: [{ key: 'getVaultsLpDeposit' }, priceQueryParams, account],
    enabled: !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let balance = ''
          try {
            const bigintBalance = await getBalanceOf(
              item.chainId,
              account as Address,
              item?.quotePoolToken,
            )
            balance = formatUnits(bigintBalance, COMMON_LP_AMOUNT_DECIMALS)
            console.log(balance)
          } catch (_e) {
            console.error(_e)
          }
          return {
            idx: item.idx,
            poolId: item.poolId,
            chainId: item.chainId,
            balance: balance,
          }
        }),
      )

      const map = (result || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.balance,
        }
      }, {} as PriceMapType)
      return map
    },
    // refetchInterval: 5000,
  })

  const pnlMap: Record<string, string> = useMemo(() => {
    if (!data?.data?.length) return {}
    return (data.data || [])
      .map((item) => {
        const price = priceMap?.[item.poolId]
        const avgPrice = item.avgLpPrice
        const lastTotal = depositMap?.[item.poolId]

        return {
          poolId: item.poolId,
          pnl: price && avgPrice && lastTotal ? calculationPnl(price, avgPrice, lastTotal) : '',
        }
      })
      .reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.pnl,
        }
      }, {})
  }, [data.data, priceMap, depositMap])

  const positions = useMemo(() => {
    if (!data?.data) return data?.data
    if (data.data?.length === 0) return [] as Vault[]

    return data.data.filter((item) => Number(depositMap?.[item.poolId]) > 0)
  }, [depositMap, data?.data])

  return (
    <Box className={'flex flex-col'}>
      <Box>
        {(isLoading ? (Array.from({ length: 3 }).fill(null) as Vault[]) : positions || []).map(
          (item, index) => {
            return (
              <Box
                className={
                  'border-base flex items-center justify-between border-b-1 px-[16px] py-[20px]'
                }
                onClick={() => {
                  if (item) {
                    navigate(`/earn/${item.chainId}/${item.poolId}`)
                  }
                }}
              >
                <Token token={item} />
                <Box className={'flex flex-col items-end gap-[4px]'}>
                  <Box className={'text-[14px] leading-[1] font-[500] text-white'}>
                    {!item ? (
                      <Skeleton width={95} />
                    ) : (
                      <>
                        $
                        {formatNumberPrecision(
                          depositMap?.[item?.poolId],
                          COMMON_BASE_DISPLAY_DECIMALS,
                        )}
                      </>
                    )}
                  </Box>

                  <Box className={'text-[12px] leading-[1] font-[500] text-white'}>
                    {!item ? (
                      <Skeleton width={60} />
                    ) : (
                      <Change change={pnlMap?.[item?.poolId]}>
                        $
                        {formatNumberPrecision(
                          pnlMap?.[item?.poolId],
                          COMMON_BASE_DISPLAY_DECIMALS,
                        )}
                      </Change>
                    )}
                  </Box>
                </Box>
              </Box>
            )
          },
        )}
        {!isLoading && positions?.length === 0 && (
          <Box>
            <Empty />
          </Box>
        )}
      </Box>
    </Box>
  )
}
