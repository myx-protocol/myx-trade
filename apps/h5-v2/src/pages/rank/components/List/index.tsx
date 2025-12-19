import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Sort } from '@/components/Sort'
import { Trans } from '@lingui/react/macro'
import { useVirtualList } from 'ahooks'
import { useCallback, useEffect, useRef } from 'react'
import { Empty } from './Empty'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { formatNumber } from '@/utils/number'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import clsx from 'clsx'
import { Loading } from './Loading'
import { useRankStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { getLeaderboard } from '@/api'
import { useNavigate } from 'react-router-dom'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { GetLeaderboardItem } from '@/api'
import dayjs from 'dayjs'
import { useSortData } from '@/hooks/useSortData'

export const List = () => {
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { timeInterval, type, chainId, tabsType, sort, setSort } = useRankStore()
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard', timeInterval, type, chainId, tabsType],
    queryFn: () => {
      return getLeaderboard({
        timeInterval,
        type,
        chainId,
        sortField: tabsType,
      })
    },
  })

  const tickerData = useMarketStore((state) => state.tickerData)

  // 使用排序 hook，只在用户点击排序时触发，ticker 数据变化不会重新排序
  const dataSorted = useSortData({
    data: data?.data || [],
    sort: {
      by: sort.by,
      direction: sort.direction,
    },
    getFieldValue: (item, field) => {
      // 对于 basePrice 和 priceChange，使用 ticker 数据，如果没有则使用原值
      if (field === 'basePrice') {
        return tickerData[item.poolId]?.price || item.basePrice
      }
      if (field === 'priceChange') {
        return tickerData[item.poolId]?.change || item.priceChange
      }
      // 其他字段使用原值
      return item[field] as string | number | undefined
    },
  })

  const [list] = useVirtualList(dataSorted, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 58,
    overscan: 3,
  })

  const { client } = useMyxSdkClient()
  const { subscribeToTicker } = useSubscription()
  useEffect(() => {
    if (client && list.length && dataSorted.length) {
      const unsubscribe = subscribeToTicker(
        list.map((item) => ({
          globalId: item.data.globalId,
          poolId: item.data.poolId,
        })),
      )
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    }
  }, [list, client, dataSorted.length, subscribeToTicker])

  const getFirstColumnKey = useCallback<() => keyof GetLeaderboardItem>(() => {
    if (tabsType === 'marketCap') {
      return 'marketCap'
    }
    if (tabsType === 'tokenCreateTime') {
      return 'tokenCreateTime'
    }
    return 'volume'
  }, [tabsType])

  const renderFirstColumnLabel = useCallback(() => {
    const key = getFirstColumnKey()
    if (key === 'marketCap') {
      return (
        <p>
          <Trans>Name / Mcap</Trans>
        </p>
      )
    }
    if (key === 'tokenCreateTime') {
      return (
        <p>
          <Trans>Name / Date</Trans>
        </p>
      )
    }
    return (
      <p>
        <Trans>Name / Volume</Trans>
      </p>
    )
  }, [getFirstColumnKey])

  const renderSecondColumnValue = useCallback(
    (item: GetLeaderboardItem) => {
      const key = getFirstColumnKey()
      if (key === 'marketCap') {
        return item.marketCap ? formatNumber(item.marketCap) : '-'
      }
      if (key === 'tokenCreateTime') {
        return dayjs.unix(item.tokenCreateTime).format('YYYY/MM/DD')
      }
      return item.volume ? formatNumber(item.volume) : '-'
    },
    [getFirstColumnKey],
  )

  const onSort = useCallback(
    (key: keyof GetLeaderboardItem | undefined, direction: 'asc' | 'desc' | 'none') => {
      setSort({
        by: direction === 'none' ? undefined : key,
        direction,
      })
    },
    [setSort],
  )
  return (
    <div className="mt-[8px] flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <MarketListRow
        className="px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
        values={[
          <Sort
            label={renderFirstColumnLabel()}
            onChange={(direction) => onSort(getFirstColumnKey(), direction)}
            isSorted={sort.by === getFirstColumnKey()}
          />,
          <Sort
            onChange={(direction) => onSort('basePrice', direction)}
            isSorted={sort.by === 'basePrice'}
            label={
              <p>
                <Trans>Last Price</Trans>
              </p>
            }
          />,
          <Sort
            onChange={(direction) => onSort('priceChange', direction)}
            isSorted={sort.by === 'priceChange'}
            label={
              <p>
                <Trans>Change %</Trans>
              </p>
            }
          />,
        ]}
      />

      {isLoading && <Loading total={10} />}
      {!isLoading && !dataSorted.length && <Empty />}
      {/* list */}
      {!isLoading && (
        <div className="min-h-0 flex-[1_1_0%] overflow-y-auto" ref={containerRef}>
          <div ref={wrapperRef} className="min-h-0 pb-[10px]">
            {list?.map((item) => (
              <MarketListRow
                key={item.index}
                className="h-[58px] px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
                onClick={() => {
                  navigate(`/price/${item.data.chainId}/${item.data.poolId}`)
                }}
                values={[
                  <div className="flex items-center gap-[8px]">
                    <p
                      className={clsx('min-w-[20px] text-[16px] leading-[1.2] font-semibold', {
                        'text-[#848E9C]': item.index + 1 > 3,
                        'text-[#FFCA40]': item.index + 1 <= 3,
                      })}
                    >
                      {item.index + 1}
                    </p>
                    <SymbolInfo
                      symbol={item.data.baseQuoteSymbol}
                      descriptionText={renderSecondColumnValue(item.data)}
                      baseLogoSize={28}
                      quoteTokenSize={10}
                      baseTokenLogo={item.data.tokenIcon}
                      chainId={item.data.chainId}
                    />
                  </div>,
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-[14px] font-medium text-white">
                      {formatNumber(tickerData[item.data.poolId]?.price || item.data.basePrice, {
                        showUnit: false,
                      })}
                    </p>
                    <p className="text-[12px] font-medium text-[#848E9C]">
                      $
                      {formatNumber(tickerData[item.data.poolId]?.price || item.data.basePrice, {
                        showUnit: false,
                      })}
                    </p>
                  </div>,
                  <PriceChangeBlock
                    value={Number(tickerData[item.data.poolId]?.change || item.data.priceChange)}
                  />,
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
