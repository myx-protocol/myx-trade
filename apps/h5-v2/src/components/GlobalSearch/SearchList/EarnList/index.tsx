import { t } from '@lingui/core/macro'
import { useGlobalSearchStore } from '../../store'
import { NotFound } from '../NotFound'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCallback, useRef } from 'react'
import type { SearchResultEarnItem } from '@myx-trade/sdk'
import { SearchListLoading } from '../Loading'
import { useUpdateEffect, useVirtualList } from 'ahooks'
import { EarnListDataRow } from './DataRow'
import { useKeyPressSelect } from '../../hooks/useLightItem'

export const EarnList = () => {
  const { searchResult, searchLoading, close } = useGlobalSearchStore()
  const location = useLocation()

  const navigate = useNavigate()
  const onItemClick = useCallback(
    (item: SearchResultEarnItem) => {
      close()
      const isEarnPage = location.pathname.startsWith('/earn/')
      navigate(`/earn/${item.chainId}/${item.poolId}`, {
        replace: isEarnPage,
      })
    },
    [navigate, close, location.pathname],
  )

  const earnInfoData = searchResult?.earnInfo

  const listContainerRef = useRef<HTMLDivElement>(null)
  const listWrapperRef = useRef<HTMLDivElement>(null)

  const [list] = useVirtualList(earnInfoData?.list || [], {
    itemHeight: 56,
    overscan: 2,
    containerTarget: listContainerRef,
    wrapperTarget: listWrapperRef,
  })

  const { lightItem, onReset } = useKeyPressSelect({
    dataList: earnInfoData?.list || [],
    onSelect: onItemClick,
  })

  useUpdateEffect(() => {
    onReset()
  }, [earnInfoData?.list])

  if (!earnInfoData?.list?.length && !searchLoading) return <NotFound />
  return (
    <div className="flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
        <div className="w-[210px]">
          <span>{t`交易对`}</span>
        </div>
        <div className="flex w-[103px] justify-end">
          <span>{t`APY`}</span>
        </div>
      </div>

      {/* list */}
      {searchLoading ? (
        <SearchListLoading line={9} />
      ) : (
        <div className="min-h-0 flex-[1_1_0%] overflow-y-auto" ref={listContainerRef}>
          <div className="min-h-0" ref={listWrapperRef}>
            {list?.map((item) => (
              <EarnListDataRow
                key={`earn-${item.index}`}
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
