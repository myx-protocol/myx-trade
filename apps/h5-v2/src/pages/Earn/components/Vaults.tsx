import { Box } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DEFAULT_LIMIT, getQuoteLpList } from '@/request'
import { useNavigate } from 'react-router-dom'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { Skeleton } from '@/components/UI/Skeleton'
import { SearchContext } from '@/pages/Earn/context.ts'
import { PageDirection } from '@/request/type.ts'
import { Change } from '@/components/Change'
import { Empty } from '@/components/Empty.tsx'
import { SortField, type Vault } from '@/pages/Earn/type.ts'
import { Token } from './Token'
import { encodeSortValue } from '@/utils/sort'
import type { QuotePool } from '@/request/lp/type.ts'
import { InfiniteScrollView } from '@/components/InfiniteScrollView.tsx'
import { isSafeNumber } from '@/utils'
import { decimalToPercent, formatNumber } from '@/utils/number.ts'

const sortField = SortField.tvl
const sortOrder = 'desc'
const limit = 20

export const Vaults = ({ className = '' }: { className?: string }) => {
  const navigate = useNavigate()
  const { chainId, interval } = useContext(SearchContext)
  const [after, setAfter] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(true)

  const [list, setList] = useState<Vault[]>([])

  const getSortValue = (item: QuotePool, sort: SortField) => {
    switch (sort) {
      case SortField.apr:
        return item.apr
      case SortField.time:
        return item.tokenCreateTime
      default:
        return item.tvl
    }
  }

  useQuery({
    queryKey: [{ key: 'quotePoolList' }, chainId, interval, after],
    queryFn: async () => {
      const paginatedLimit = limit + 1
      const result = await getQuoteLpList({
        timeInterval: interval,
        chainId: chainId,
        sortField,
        sortOrder,
        limit: paginatedLimit,
        direction: after ? PageDirection.Next : undefined,
        cursor: after,
      })
      setIsLoading(false)

      const hasNoMoreData = (result.data || []).length < paginatedLimit
      setHasMore(!hasNoMoreData)

      const data = (result?.data || []).slice(0, limit).map((quote, index) => {
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
          sortValue: getSortValue(quote, sortField),
        } as Vault
      })

      if (after) {
        setList((prev) => [...prev, ...(data || [])])
      } else {
        setList([...data])
      }
    },
    placeholderData: (prev) => prev,
  })

  const loadMore = () => {
    // 触底回调
    // if (isLoading || !data.hasNextPage) return
    console.log('loadMore......')

    setAfter(() => (list && list.length ? encodeSortValue(list?.[list?.length - 1]) : undefined))
  }

  useEffect(() => {
    setAfter(undefined)
    setHasMore(true)
    setIsLoading(true)
  }, [chainId])

  useEffect(() => {
    setAfter(undefined)
    setHasMore(true)
    setIsLoading(true)
  }, [interval])

  return (
    <InfiniteScrollView
      dataLength={list.length}
      loadMore={loadMore}
      hasMore={hasMore}
      scrollableTarget={'scrollView'}
    >
      {(isLoading ? (Array.from({ length: limit }).fill(null) as Vault[]) : list).map(
        (item, index) => {
          return (
            <Box
              key={index}
              className={
                'border-base flex items-center justify-between border-b-1 px-[16px] py-[20px]'
              }
              onClick={() => {
                if (item) {
                  navigate(`/earn/${item?.chainId}/${item?.poolId}`)
                }
              }}
            >
              <Token token={item} />
              <Box className={'flex flex-col items-end gap-[4px]'}>
                <Box className={'text-[14px] leading-[1] font-[500] text-white'}>
                  {!item ? (
                    <Skeleton width={95} />
                  ) : (
                    <>${formatNumber(item.tvl, { showUnit: false })}</>
                  )}
                </Box>

                <Box className={'text-[12px] leading-[1] font-[500] text-white'}>
                  {!item ? (
                    <Skeleton width={60} />
                  ) : (
                    <Change change={item.apr} className={'text-secondary'}>
                      {isSafeNumber(item?.apr) ? decimalToPercent(item.apr) : '--%'}
                    </Change>
                  )}
                </Box>
              </Box>
            </Box>
          )
        },
      )}
      {!hasMore && list?.length === 0 && (
        <Box>
          <Empty />
        </Box>
      )}
    </InfiniteScrollView>
  )
}
