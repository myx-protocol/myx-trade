import { t } from '@lingui/core/macro'
import { useGlobalSearchStore } from '../../store'
import { NotFound } from '../NotFound'
import { useNavigate } from 'react-router-dom'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { SearchResultEarnItem } from '@myx-trade/sdk'
import { SearchListLoading } from '../Loading'
import {
  useDebounceFn,
  useMount,
  useThrottleFn,
  useUnmount,
  useUpdateEffect,
  useVirtualList,
} from 'ahooks'
import { EarnListDataRow } from './DataRow'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'

export const EarnList = () => {
  const { searchResult, searchLoading, close } = useGlobalSearchStore()

  const navigate = useNavigate()
  const onItemClick = useCallback(
    (item: SearchResultEarnItem) => {
      close()
      navigate(`/earn/${item.chainId}/${item.poolId}`)
    },
    [navigate, close],
  )

  const earnInfoData = searchResult?.earnInfo

  const renderDataList = useMemo(() => {
    return [
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
      ...(earnInfoData?.list ?? []),
    ]
  }, [earnInfoData?.list])

  const listContainerRef = useRef<HTMLDivElement>(null)
  const listWrapperRef = useRef<HTMLDivElement>(null)

  const [list] = useVirtualList(renderDataList || [], {
    itemHeight: 56,
    overscan: 2,
    containerTarget: listContainerRef,
    wrapperTarget: listWrapperRef,
  })

  if (!earnInfoData?.list?.length && !searchLoading) return <NotFound />
  return (
    <div className="flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <div className="flex justify-between gap-[64.67px] px-[12px] py-[8px] text-[12px] leading-[1] font-normal text-[#6D7180]">
        <div className="w-[210px]">
          <span>{t`交易对`}</span>
        </div>
        <div className="flex w-[105px] justify-end">
          <span>{t`TVL/市值`}</span>
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
