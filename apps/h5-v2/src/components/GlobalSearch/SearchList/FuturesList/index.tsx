import { t } from '@lingui/core/macro'
import { useGlobalSearchStore } from '../../store'
import { SearchSecondTypeEnum, type SearchResultContractItem } from '@myx-trade/sdk'
import { NotFound } from '../NotFound'
import { type ReactNode, useCallback, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { SearchListLoading } from '../Loading'
import { useDebounceFn, useMount, useUnmount, useUpdateEffect, useVirtualList } from 'ahooks'
import { FuturesListDataRow } from './DataRow'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useKeyPressSelect } from '../../hooks/useLightItem'
import { FavoritesDefault } from '@/components/FavoritesDefault'
import { tradePubSub } from '@/utils/pubsub'

interface FuturesListProps {
  emptyNode?: ReactNode
  onClose?: () => void
}

export const FuturesList = ({ emptyNode, onClose }: FuturesListProps = {}) => {
  const { searchResult, searchLoading, close, secondSearchTab } = useGlobalSearchStore()
  const location = useLocation()
  const navigate = useNavigate()
  const contractInfoData = searchResult?.contractInfo

  const onItemClick = useCallback(
    (item: SearchResultContractItem) => {
      if (onClose) {
        onClose()
      } else {
        close()
      }
      const isTradePage = location.pathname.startsWith('/trade/')
      navigate(`/trade/${item.chainId}/${item.poolId}`, {
        replace: isTradePage,
      })
    },
    [navigate, close, onClose, location.pathname],
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

  useUpdateEffect(() => {
    if (activePool.length) {
      const unSubscribe = subscribeToTicker(activePool)
      return () => {
        if (unSubscribe) unSubscribe()
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

  const { lightItem, onReset } = useKeyPressSelect({
    dataList: contractInfoData?.list || [],
    onSelect: onItemClick,
  })

  useUpdateEffect(() => {
    onReset()
  }, [contractInfoData?.list])

  if (!contractInfoData?.list?.length && !searchLoading) {
    if (secondSearchTab === SearchSecondTypeEnum.Favorite) {
      if (searchResult?.contractInfo.favorites?.length) {
        return (
          <div className="px-[12px]">
            <FavoritesDefault
              favorites={searchResult?.contractInfo.favorites || []}
              onAddFavoritesSuccess={() => {
                tradePubSub.emit('global:search:update')
              }}
            />
          </div>
        )
      }
    }
    return emptyNode !== undefined ? <>{emptyNode}</> : <NotFound />
  }

  return (
    <div className="flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] text-[#6D7180]">
        <div className="w-[210px]">
          <span>{t`交易对`}</span>
        </div>
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
                isLightMode={
                  lightItem.chainId === item.data.chainId && lightItem.poolId === item.data.poolId
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
