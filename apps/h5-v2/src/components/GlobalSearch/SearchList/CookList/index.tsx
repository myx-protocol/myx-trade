import { t } from '@lingui/core/macro'
import { useGlobalSearchStore } from '../../store'
import { NotFound } from '../NotFound'
import type { SearchResultCookItem } from '@myx-trade/sdk'
import { useNavigate } from 'react-router-dom'
import { useCallback, useRef } from 'react'
import { SearchListLoading } from '../Loading'
import { useVirtualList } from 'ahooks'
import { CookListDataRow } from './DataRow'

export const CookList = () => {
  const { searchResult, searchLoading, close } = useGlobalSearchStore()

  const navigate = useNavigate()
  const onItemClick = useCallback(
    (item: SearchResultCookItem) => {
      close()
      navigate(`/cook/${item.chainId}/${item.poolId}`)
    },
    [navigate, close],
  )

  const cookInfoData = searchResult?.cookInfo

  const listContainerRef = useRef<HTMLDivElement>(null)
  const listWrapperRef = useRef<HTMLDivElement>(null)

  const [list] = useVirtualList(cookInfoData?.list || [], {
    itemHeight: 56,
    overscan: 7,
    containerTarget: listContainerRef,
    wrapperTarget: listWrapperRef,
  })

  if (!cookInfoData?.list.length && !searchLoading) return <NotFound />

  return (
    <div className="flex flex-[1_1_0%] flex-col">
      {/* header */}
      <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
        <div className="w-[210px]">
          <span>{t`交易对`}</span>
        </div>
        <div className="flex w-[103px] justify-end">
          <span>{t`最新价/24h涨跌幅`}</span>
        </div>
      </div>

      {/* list */}
      {searchLoading ? (
        <SearchListLoading line={9} />
      ) : (
        <div className="min-h-0 flex-[1_1_0%] overflow-y-auto" ref={listContainerRef}>
          <div className="min-h-0" ref={listWrapperRef}>
            {list?.map((item) => (
              <CookListDataRow
                key={`search-cook-${item.index}`}
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
