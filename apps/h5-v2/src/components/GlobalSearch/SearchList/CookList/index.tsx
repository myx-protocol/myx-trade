import { t } from '@lingui/core/macro'
import { useGlobalSearchStore } from '../../store'
import { NotFound } from '../NotFound'
import type { SearchResultCookItem } from '@myx-trade/sdk'
import { useNavigate } from 'react-router-dom'
import { useCallback } from 'react'
import { SearchListLoading } from '../Loading'
import { CookListDataRow } from './DataRow'
import { useKeyPressSelect } from '../../hooks/useLightItem'

interface CookListProps {
  variant?: 'cook' | 'base_vault'
}

export const CookList = ({ variant = 'base_vault' }: CookListProps) => {
  const { searchResult, searchLoading, close } = useGlobalSearchStore()

  const navigate = useNavigate()
  const onItemClick = useCallback(
    (item: SearchResultCookItem) => {
      close()
      if (variant === 'cook') {
        navigate(`/cook/${item.chainId}/${item.poolId}`)
      } else {
        navigate(`/cook/${item.chainId}/${item.poolId}`)
      }
    },
    [navigate, close, variant],
  )

  const cookInfoData =
    variant === 'cook' ? (searchResult as any)?.cookV2Info : searchResult?.cookInfo
  const listData = (cookInfoData?.list || []) as (SearchResultCookItem & { progress?: string })[]

  const { lightItem } = useKeyPressSelect({
    dataList: listData,
    onSelect: onItemClick,
  })

  if (!listData.length && !searchLoading) return <NotFound />

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
        <div className="min-h-0 flex-[1_1_0%] overflow-y-auto">
          {listData.map((item, index) => (
            <CookListDataRow
              key={`cook-${index}`}
              item={item}
              onItemClick={onItemClick}
              isLightMode={lightItem.chainId === item.chainId && lightItem.poolId === item.poolId}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  )
}
