import { useContext, useEffect, useMemo, useState } from 'react'
import { styled, TableCell, tableCellClasses, TableContainer, TableRow } from '@mui/material'
import { Next, Prev } from '@/components/Icon'
import { CookType, type Token, TrenchType } from '@/pages/Cook/type.ts'
import Box from '@mui/material/Box'
import { Copy } from '@/components/Copy.tsx'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getTrenchList } from '@/request'
import type { PriceMapType, Trench } from '@/request/lp/type.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { getTimeDiff } from '@/utils/date.ts'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { formatNumber } from '@/utils/number.ts'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import {
  type Address,
  Interval,
  PageDirection,
  type SortOrder,
  type TrenchSortField,
} from '@/request/type.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { base as Base, COMMON_PRICE_DECIMALS, formatUnits, getBalanceOf } from '@myx-trade/sdk'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Empty } from '@/components/Empty.tsx'
import { encodeSortValue } from '@/utils/sort.ts'
import { Trans } from '@lingui/react/macro'
import { Change } from '@/components/Change.tsx'

interface Data {
  id: number | string
  market: Token
  price: string
  change: string
  apr: string
  tvl: string
  volume: string
  open: string
  chainId: number
  poolId: string
  sortValue: string
}

export const TrenchList = ({
  sortField,
  interval,
  chainId,
}: {
  sortField: TrenchType
  interval?: Interval
  chainId?: number
}) => {
  const navigate = useNavigate()
  const { type } = useContext(CookContext)
  const { address: account } = useWalletConnection()
  const [order, setOrder] = useState<SortOrder>('desc')
  const [before, setBefore] = useState<string | undefined>(undefined)
  const [after, setAfter] = useState<string | undefined>(undefined)

  const getSortValue = (item: Trench) => {
    switch (sortField) {
      case TrenchType.Gainers:
        return item.lpPriceChange
      case TrenchType.Latest:
        return item.tokenCreateTime
      case TrenchType.APR:
        return item.apr
      case TrenchType.Eligible:
        return item.tvl
    }
  }

  const { data = { data: [], hasNextPage: false, hasPrevPage: false }, isLoading } = useQuery({
    queryKey: [
      { key: 'TokenNewList' },
      type,
      interval,
      chainId,
      sortField,
      order,
      account,
      before,
      after,
    ],
    enabled: type === CookType.Trench,
    queryFn: async () => {
      const limit = DEFAULT_LIMIT
      const paginatedLimit = limit + 1
      const result = await getTrenchList({
        timeInterval: interval || undefined,
        chainId: chainId || undefined,
        sortField: sortField as unknown as TrenchSortField,
        sortOrder: order,
        limit: paginatedLimit,
        direction: before ? PageDirection.Prev : after ? PageDirection.Next : undefined,
        cursor: before || after,
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

      const paginatedData = {
        data: (limit ? result.data.slice(0, limit) : result.data).map((item: Trench) => {
          return {
            id: item.id,
            sortValue: getSortValue(item),
            market: {
              icon: item.tokenIcon,
              name: item.mBaseQuoteSymbol,
              label: item.mSymbol,
              chainId: item.chainId,
              address: item.baseToken,
              time: item.tokenCreateTime,
            },
            price: '',
            change: item.lpPriceChange,
            apr: item.apr,
            tvl: item.tvl,
            volume: item.volume,
            open: item.oi,
            chainId: item.chainId,
            poolId: item.poolId,
          } as Data
        }),
        hasNextPage,
        hasPrevPage,
      }

      return paginatedData
    },
    refetchOnWindowFocus: true, // 默认 true
    refetchOnMount: true, // 组件重新挂载时刷新
    refetchOnReconnect: true, // 网络恢复时刷新
  })

  const priceQueryParams = useMemo(() => {
    return (data.data || []).map((item) => ({ poolId: item.poolId, chainId: item.chainId }))
  }, [data.data])

  const { data: priceMap } = useQuery({
    queryKey: [{ key: 'getTrendLpAssetsPrice' }, priceQueryParams],
    enabled: !!priceQueryParams.length,
    queryFn: async () => {
      if (!priceQueryParams.length) return {} as PriceMapType
      const result = await Promise.all(
        priceQueryParams.map(async (item) => {
          let _price = ''
          try {
            const rs = await Base.getLpPrice(item.chainId, item.poolId)
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

  const { data: valueMap } = useQuery({
    queryKey: [{ key: 'getTrendLpAssetsBalance' }, priceQueryParams, account, sortField],
    queryFn: async () => {
      if (sortField !== TrenchType.Eligible) return {} as PriceMapType
      const balances = await Promise.all(
        (data.data || []).map(async (item) => {
          let balance = ''
          try {
            // 更改为 mobula 的价值
            const _balance = await getBalanceOf(
              item.chainId,
              account as Address,
              item.market.address,
            )
            balance = formatUnits(_balance, 6) //item.baseDecimals
          } catch (_e) {
            console.error(_e)
          }
          return {
            poolId: item.poolId,
            balance,
          }
        }),
      )
      const map = (balances || []).reduce((acc, cur) => {
        return {
          ...acc,
          [cur.poolId]: cur.balance,
        } as PriceMapType
      }, {} as PriceMapType)
      return map
    },
  })

  useEffect(() => {
    setOrder('desc')
    setBefore(undefined)
    setAfter(undefined)
  }, [sortField])

  const sortedData = useMemo(() => {
    if (!data?.data?.length) return data?.data
    if (!(account && sortField === TrenchType.Eligible)) return data?.data
    return [...(data?.data || [])].sort(
      (a, b) => Number(valueMap?.[b.poolId]) - Number(valueMap?.[a.poolId]) || 0,
    )
  }, [data.data])

  return (
    <Box>
      {(isLoading ? (Array.from({ length: 3 }).fill(null) as Data[]) : sortedData || []).map(
        (row, index) => {
          return (
            <Box
              key={index}
              className={`item border-base hover:bg-base-bg flex items-center justify-between px-[16px] py-[20px] [&+.item]:border-t-1 ${isLoading ? 'pointer-events-none' : 'cursor-pointer'}`}
              onClick={() => {
                if (row) {
                  navigate(`/cook/${row.market.chainId}/${row.poolId}`)
                }
              }}
            >
              <Box className={'flex flex-1 items-center gap-[6px]'}>
                <Box className={'relative aspect-square'}>
                  {isLoading ? (
                    <Skeleton width={40} height={40} className={'rounded-full'} />
                  ) : (
                    <CoinIcon icon={row?.market.icon} size={40} symbol={row?.market.label} />
                  )}
                  <Box
                    className={
                      'absolute right-[-2px] bottom-0 aspect-square h-[16px] w-[16px] min-w-[16px] overflow-hidden rounded-full'
                    }
                  >
                    {isLoading ? (
                      <Skeleton width={12} height={12} />
                    ) : (
                      <CoinIcon
                        size={12}
                        icon={
                          CHAIN_INFO?.[row.market?.chainId as keyof typeof CHAIN_INFO]?.logoUrl ??
                          ''
                        }
                      />
                    )}
                  </Box>
                </Box>
                <Box className={'flex flex-col gap-[10px]'}>
                  <Box className={'flex items-center gap-[10px] leading-[1]'}>
                    {isLoading ? (
                      <Skeleton width={'30%'} />
                    ) : (
                      <>
                        <span className={'text-[14px] font-[700] text-white'}>
                          {row.market.label}
                        </span>
                        <span className={'text-secondary text-[12px]'}>{row.market.name}</span>
                      </>
                    )}
                  </Box>
                  <Box className={'flex items-center gap-[4px] text-[12px]'}>
                    {isLoading ? (
                      <Skeleton width={'50%'} />
                    ) : (
                      <>
                        <span className={'text-secondary'}>
                          <Trans>APR</Trans>
                        </span>
                        <span className={'font-[500] text-white'}>
                          {formatNumberPercent(row?.apr)}
                        </span>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box className={'flex shrink-0 flex-col justify-end gap-[10px] leading-[1]'}>
                <Box className={'text-[14px] font-[500] text-white'}>
                  {isLoading ? (
                    <Skeleton width={60} />
                  ) : (
                    <>
                      $
                      {formatNumberPrecision(priceMap?.[row.poolId], COMMON_PRICE_DISPLAY_DECIMALS)}
                    </>
                  )}
                </Box>
                <Box className={'flex gap-[4px] text-[12px]'}>
                  <span className={'text-secondary'}>
                    <Trans>Chg</Trans>
                  </span>
                  <Change className={'font-[500]'} change={row?.change}>
                    {' '}
                    {formatNumberPercent(row?.change)}
                  </Change>
                </Box>
              </Box>
            </Box>
          )
        },
      )}

      {!isLoading && data?.data?.length === 0 && (
        <Box>
          <Empty />
        </Box>
      )}
    </Box>
  )
}
