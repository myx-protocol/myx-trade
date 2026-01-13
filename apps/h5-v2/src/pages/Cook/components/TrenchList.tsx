import { useContext, useEffect, useMemo, useState } from 'react'
import { CookType, type Token, TrenchType } from '@/pages/Cook/type.ts'
import Box from '@mui/material/Box'
import { useQuery } from '@tanstack/react-query'
import { getTrenchList } from '@/request'
import type { PriceMapType, Trench } from '@/request/lp/type.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { useNavigate } from 'react-router-dom'
import { CookContext } from '@/pages/Cook/context.ts'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { Interval, PageDirection, type SortOrder, type TrenchSortField } from '@/request/type.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { base as Base, COMMON_PRICE_DECIMALS, formatUnits } from '@myx-trade/sdk'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { Empty } from '@/components/Empty.tsx'
import { Trans } from '@lingui/react/macro'
import { Change } from '@/components/Change.tsx'
import { decimalToPercent } from '@/utils/number.ts'
import { isSafeNumber } from '@/utils'
import { InfiniteScrollView } from '@/components/InfiniteScrollView'
import { encodeSortValue } from '@/utils/sort.ts'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'

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

const limit = 20

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
  const { markets } = useMyxSdkClient()
  const { address: account } = useWalletConnection()
  const [after, setAfter] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [list, setList] = useState<Data[]>([])

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

  const { isLoading } = useQuery({
    queryKey: [{ key: 'TokenNewList' }, type, interval, chainId, sortField, account, after],
    enabled: type === CookType.Trench,
    queryFn: async () => {
      const paginatedLimit = limit + 1
      const result = await getTrenchList({
        timeInterval: interval || undefined,
        chainId: chainId || undefined,
        sortField: sortField as unknown as TrenchSortField,
        sortOrder: 'desc',
        limit: paginatedLimit,
        direction: after ? PageDirection.Next : undefined,
        cursor: after,
      })

      const hasNoMoreData = (result.data || []).length < paginatedLimit
      setHasMore(!hasNoMoreData)

      const data = (result?.data || []).slice(0, limit).map((item: Trench) => {
        return {
          id: item.id,
          sortValue: getSortValue(item),
          market: {
            icon: item.tokenIcon,
            name: item.mBaseQuoteSymbol,
            label: item.symbol,
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
      })
      if (after) {
        setList((prev) => [...prev, ...(data || [])])
      } else {
        setList([...data])
      }
      return data
    },
    placeholderData: (prev) => prev,
  })

  const priceQueryParams = useMemo(() => {
    return (list || []).map((item) => ({ poolId: item.poolId, chainId: item.chainId }))
  }, [list])

  const { data: priceMap } = useQuery({
    queryKey: [{ key: 'getTrendLpAssetsPrice' }, priceQueryParams],
    enabled: !!priceQueryParams.length && !!markets?.length,
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

  const loadMore = () => {
    // 触底回调
    // if (isLoading || !data.hasNextPage) return
    console.log('loadMore......')

    setAfter(() => (list && list.length ? encodeSortValue(list?.[list?.length - 1]) : undefined))
  }

  const sortedData = useMemo(() => {
    return list || []
  }, [list])

  useEffect(() => {
    setAfter(undefined)
    setHasMore(true)
    setList([])
    // set(true)
  }, [chainId, interval, sortField])

  return (
    <InfiniteScrollView
      dataLength={list.length}
      loadMore={loadMore}
      hasMore={hasMore}
      scrollableTarget={'scrollView'}
    >
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
                      'absolute right-[-3px] bottom-0 aspect-square h-[12px] w-[12px] min-w-[12px] overflow-hidden rounded-full'
                    }
                  >
                    {isLoading ? (
                      <Skeleton width={12} height={12} />
                    ) : (
                      <CoinIcon
                        size={12}
                        className={'border-deep overflow-hidden rounded-full border-1'}
                        icon={
                          CHAIN_INFO?.[row.market?.chainId as keyof typeof CHAIN_INFO]?.logoUrl ??
                          ''
                        }
                      />
                    )}
                  </Box>
                </Box>
                <Box className={'flex flex-1 flex-col gap-[10px]'}>
                  <Box className={'flex items-center gap-[10px] leading-[1]'}>
                    {isLoading ? (
                      <Skeleton width={'30%'} />
                    ) : (
                      <>
                        <span className={'text-[14px] font-[700] text-white'}>
                          {row.market.name}
                        </span>
                        <span className={'text-secondary text-[12px]'}>{row.market.label}</span>
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
                        <Change change={row?.apr} className={'font-[500] text-white'}>
                          {isSafeNumber(row?.apr) ? decimalToPercent(row?.apr) : '--'}
                        </Change>
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
              <Box className={'flex shrink-0 flex-col justify-end gap-[10px] leading-[1]'}>
                <Box className={'text-right text-[14px] font-[500] text-white'}>
                  {isLoading ? (
                    <Skeleton width={60} />
                  ) : (
                    <>
                      $
                      {formatNumberPrecision(priceMap?.[row.poolId], COMMON_PRICE_DISPLAY_DECIMALS)}
                    </>
                  )}
                </Box>
                <Box className={'flex justify-end gap-[4px] text-[12px]'}>
                  <span className={'text-secondary'}>
                    <Trans>Chg</Trans>
                  </span>
                  <Change className={'font-[500]'} change={row?.change}>
                    {isSafeNumber(row?.change) ? decimalToPercent(row?.change) : '--'}
                  </Change>
                </Box>
              </Box>
            </Box>
          )
        },
      )}

      {!isLoading && list?.length === 0 && (
        <Box>
          <Empty />
        </Box>
      )}
    </InfiniteScrollView>
  )
}
