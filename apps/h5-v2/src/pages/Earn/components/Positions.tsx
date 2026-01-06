import { Box } from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { type QueryKey, useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getACQuoteLpList } from '@/request'
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
import { InfiniteScrollView } from '@/components/InfiniteScrollView.tsx'
import { encodeSortValue } from '@/utils/sort.ts'
const sortField = SortField.tvl
const sortOrder = 'desc'
const limit = 20

export const Positions = ({ className = '' }: { className?: string }) => {
  const navigate = useNavigate()
  const { accessToken } = useAccessToken()
  const { address: account } = useWalletConnection()
  const { chainId, interval } = useContext(SearchContext)

  const [isLoading, setIsLoading] = useState(true)

  // const [list, setList] = useState<Vault[]>([])

  const paginatedLimit = limit + 1

  const infiniteQuery = useInfiniteQuery<{ list: Vault[]; nextCursor?: string }>({
    queryKey: ['quotePositionList', account, accessToken, chainId, interval],
    enabled: !!account && !!accessToken,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam as undefined | string

      const result = await getACQuoteLpList(account!, accessToken!, {
        timeInterval: interval,
        chainId,
        sortField,
        sortOrder,
        limit: paginatedLimit,
        direction: cursor ? PageDirection.Next : undefined,
        cursor,
      })
      setIsLoading(false)

      const raw = result?.data || []
      const data = raw.slice(0, limit).map((quote, index) => {
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
          sortValue: quote?.tvl,
        } as Vault
      })

      return {
        list: data,
        nextCursor:
          raw.length < paginatedLimit ? undefined : encodeSortValue(data?.[data?.length - 1]),
      }
    },
    placeholderData: (prev) => prev,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  const list = useMemo(() => {
    return infiniteQuery.data?.pages.flatMap((p) => p.list as Vault[]) ?? ([] as Vault[])
  }, [infiniteQuery.data])

  const priceQueryParams = useMemo(() => {
    return (list as Vault[]).map((item) => ({
      poolId: item.poolId,
      chainId: item.chainId,
      idx: item.idx,
      quotePoolToken: item.quotePoolToken,
    }))
  }, [list])

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
    enabled: !!priceQueryParams.length && !!account,
    queryFn: async () => {
      if (!priceQueryParams.length || !account) return {} as PriceMapType
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
    if (!list.length) return {}
    return (list || [])
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
  }, [list, priceMap, depositMap])

  const positions = useMemo(() => {
    return list.filter((item) => Number(depositMap?.[item.poolId]) > 0)
  }, [depositMap, list])

  useEffect(() => {
    setIsLoading(true)
  }, [chainId, interval, account, accessToken])

  return (
    <InfiniteScrollView
      dataLength={list.length}
      loadMore={() => infiniteQuery.fetchNextPage()}
      hasMore={!!infiniteQuery.hasNextPage}
      scrollableTarget={'scrollView'}
    >
      {(isLoading
        ? (Array.from({ length: limit }).fill(null) as Vault[])
        : (positions as Vault[]) || ([] as Vault[])
      ).map((item, index) => {
        return (
          <Box
            key={index}
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
                    ${formatNumberPrecision(pnlMap?.[item?.poolId], COMMON_BASE_DISPLAY_DECIMALS)}
                  </Change>
                )}
              </Box>
            </Box>
          </Box>
        )
      })}
      {!isLoading && list?.length === 0 && (
        <Box>
          <Empty />
        </Box>
      )}
    </InfiniteScrollView>
  )
}
