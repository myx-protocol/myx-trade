import { t } from '@lingui/core/macro'
import { useGlobalSearchStore } from '../../store'
import { type SearchResultContractItem } from '@myx-trade/sdk'
import { NotFound } from '../NotFound'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchListLoading } from '../Loading'
import { useDebounceFn, useMount, useUnmount, useUpdateEffect, useVirtualList } from 'ahooks'
import { FuturesListDataRow } from './DataRow'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'

export const FuturesList = () => {
  const { searchResult, searchLoading, close } = useGlobalSearchStore()
  const navigate = useNavigate()
  const contractInfoData = searchResult?.contractInfo

  const onItemClick = useCallback(
    (item: SearchResultContractItem) => {
      close()
      navigate(`/trade/${item.chainId}/${item.poolId}`)
    },
    [navigate, close],
  )

  const listContainerRef = useRef<HTMLDivElement>(null)
  const listWrapperRef = useRef<HTMLDivElement>(null)

  const [list] = useVirtualList(contractInfoData?.list || [], {
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
    console.log('activePool')
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
        <div className="w-[210px]">
          <span>{t`交易对`}</span>
        </div>
        {/* change 24h */}
        <div className="flex w-[103px] justify-end">
          <span>{t`最新价/24h涨跌幅`}</span>
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
