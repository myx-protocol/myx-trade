import { useGlobalContractSearchStore } from '../../store'
import { type SearchResultContractItem } from '@myx-trade/sdk'
import { NotFound } from '../NotFound'
import { useCallback, useRef, useState } from 'react'
import { SearchListLoading } from '../Loading'
import { useDebounceFn, useMount, useUnmount, useUpdateEffect, useVirtualList } from 'ahooks'
import { FuturesListDataRow } from './DataRow'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { Sort } from '@/components/Sort'
import { Trans } from '@lingui/react/macro'
import { useSortData } from '@/hooks/useSortData'
import { useMarketStore } from '@/components/Trade/store/MarketStore'

interface FuturesListProps {
  onSelected: (item: SearchResultContractItem) => void
}

export const FuturesList = ({ onSelected }: FuturesListProps) => {
  const { searchResult, searchLoading, sort, setSort } = useGlobalContractSearchStore()
  const contractInfoData = searchResult?.contractInfo
  const tickerData = useMarketStore((state) => state.tickerData)

  const onItemClick = useCallback(
    (item: SearchResultContractItem) => {
      onSelected(item)
    },
    [onSelected],
  )

  // 使用排序 hook，只在用户点击排序时触发，ticker 数据变化不会重新排序
  const dataSorted = useSortData({
    data: contractInfoData?.list || [],
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
      // 对于 marketCap，也可以直接使用
      if (field === 'marketCap') {
        return item.marketCap
      }
      // 其他字段使用原值
      return item[field] as string | number | undefined
    },
  })

  const listContainerRef = useRef<HTMLDivElement>(null)
  const listWrapperRef = useRef<HTMLDivElement>(null)

  const [list] = useVirtualList(dataSorted, {
    itemHeight: 56,
    overscan: 7,
    containerTarget: listContainerRef,
    wrapperTarget: listWrapperRef,
  })

  interface ActivePool {
    poolId: string
    globalId: number
  }

  const [activePool, setActivePool] = useState<Array<ActivePool>>([])

  const { flush, run } = useDebounceFn(
    () => {
      // console.log(list, 'list-list')
      setActivePool(
        list.map((item) => ({
          poolId: item.data.poolId,
          globalId: item.data.globalId,
        })),
      )
    },
    {
      wait: 500,
    },
  )

  const { subscribeToTicker } = useSubscription()

  // subscribe ticker data
  useUpdateEffect(() => {
    if (activePool.length) {
      const unSubscribe = subscribeToTicker(activePool)
      return () => {
        if (unSubscribe) {
          unSubscribe()
        }
      }
    }
  }, [activePool, subscribeToTicker])

  useMount(() => {
    flush()
  })

  useUpdateEffect(() => {
    run()
  }, [list])

  useUnmount(() => {
    setActivePool([])
  })

  if (!contractInfoData?.list?.length && !searchLoading) return <NotFound />

  return (
    <div className="flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] text-[#6D7180]">
        {/* pair */}
        <div className="flex w-[107px] items-center gap-[2px]">
          <Sort
            label={<Trans>Pair/Vol</Trans>}
            onChange={(direction) =>
              setSort({
                by: direction === 'none' ? undefined : 'baseToken',
                direction,
              })
            }
            isSorted={sort.by === 'baseToken'}
            defaultOrder={sort.by === 'baseToken' ? sort.direction : 'none'}
          />
        </div>
        {/* change 24h */}
        <div className="flex flex-[1_1_0%] justify-end whitespace-nowrap">
          <div className="flex items-center gap-[2px]">
            <Sort
              label={<Trans>Last Price</Trans>}
              onChange={(direction) =>
                setSort({
                  by: direction === 'none' ? undefined : 'basePrice',
                  direction,
                })
              }
              isSorted={sort.by === 'basePrice'}
              defaultOrder={sort.by === 'basePrice' ? sort.direction : 'none'}
            />
          </div>
          <div className="px-[2px]">/</div>
          <div className="flex items-center gap-[2px]">
            <Sort
              label={<Trans>24h Change</Trans>}
              onChange={(direction) =>
                setSort({
                  by: direction === 'none' ? undefined : 'priceChange',
                  direction,
                })
              }
              isSorted={sort.by === 'priceChange'}
              defaultOrder={sort.by === 'priceChange' ? sort.direction : 'none'}
            />
          </div>
          {/* <span>{t`最新价/24h涨跌幅`}</span> */}
        </div>
      </div>

      {/* list */}
      {searchLoading ? (
        <SearchListLoading />
      ) : (
        <div className="min-h-0 flex-[1_1_0%] overflow-y-auto" ref={listContainerRef}>
          <div className="min-h-0" ref={listWrapperRef}>
            {list?.map((item) => (
              <FuturesListDataRow
                key={`futures-${item.data.chainId}-${item.data.poolId}`}
                item={item.data}
                onItemClick={onItemClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
