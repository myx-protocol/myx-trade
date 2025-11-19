import { EarnList } from './EarnList'
import { useGlobalSearchStore } from '../store'
import { SearchTypeEnum } from '@myx-trade/sdk'
import { Trans } from '@lingui/react/macro'
import { NotFound } from './NotFound'
import { SearchListLoading } from './Loading'
import { t } from '@lingui/core/macro'
import { FuturesListDataRow } from './FuturesList/DataRow'
import { CookListDataRow } from './CookList/DataRow'
import { EarnListDataRow } from './EarnList/DataRow'

const previewLimit = 3

export const AllList = () => {
  const { setSearchTab, searchResult, searchLoading } = useGlobalSearchStore()

  if (searchLoading) {
    return <SearchListLoading line={9} />
  }
  if (
    !searchResult?.contractInfo.list?.length &&
    !searchResult?.cookInfo.list?.length &&
    !searchResult?.earnInfo.list?.length
  ) {
    return <NotFound />
  }

  return (
    <div className="flex flex-[1_1_0%] flex-col gap-[12px] overflow-y-auto">
      {/* contract list */}
      <div>
        <p className="mb-[8px] px-[12px] text-[14px] leading-[14px] font-medium text-[#CED1D9]">
          <Trans>合约</Trans>
        </p>
        <div className="flex justify-between gap-[64.67px] px-[12px] py-[8px] text-[12px] leading-[1] font-normal text-[#6D7180]">
          {/* pair */}
          <div className="w-[210px]">
            <span>{t`交易对`}</span>
          </div>
          {/* volume */}
          <div className="flex w-[105px] justify-end">
            <span>
              {t`TVL`}/{t`市值`}
            </span>
          </div>
          {/* change 24h */}
          <div className="flex w-[103px] justify-end">
            <span>{t`最新价/24h涨跌幅`}</span>
          </div>
        </div>
        <div>
          {searchResult?.contractInfo.list?.slice(0, previewLimit).map((item) => (
            <FuturesListDataRow
              key={`futures-${item.chainId}-${item.poolId}`}
              item={item}
              onItemClick={() => {}}
            />
          ))}
        </div>
        <div className="px-[12px] py-[12px] leading-[1]">
          <span
            className="text-[12px] font-medium text-[#00E3A5]"
            role="button"
            onClick={() => setSearchTab(SearchTypeEnum.Contract)}
          >{t`查看所有结果(${searchResult.contractInfo?.total || '0'})`}</span>
        </div>
      </div>

      {/* cook list */}
      <div>
        <p className="mb-[8px] px-[12px] text-[14px] leading-[14px] font-medium text-[#CED1D9]">
          <Trans>Cook</Trans>
        </p>
        <div>
          <div className="flex justify-between gap-[64.67px] px-[12px] py-[8px] text-[12px] leading-[1] font-normal text-[#6D7180]">
            <div className="w-[210px]">
              <span>{t`交易对`}</span>
            </div>
            <div className="flex w-[105px] justify-end">
              <span>{t`TVL/市值`}</span>
            </div>
            <div className="flex w-[103px] justify-end">
              <span>{t`最新价/24h涨跌幅`}</span>
            </div>
          </div>
          <div>
            {searchResult?.cookInfo.list?.slice(0, previewLimit).map((item) => (
              <CookListDataRow
                key={`cook-${item.chainId}-${item.poolId}`}
                item={item}
                onItemClick={() => {}}
              />
            ))}
          </div>
          <div className="px-[12px] py-[12px] leading-[1]">
            <span
              className="text-[12px] font-medium text-[#00E3A5]"
              role="button"
              onClick={() => setSearchTab(SearchTypeEnum.Cook)}
            >{t`查看所有结果(${searchResult.cookInfo?.total || '0'})`}</span>
          </div>
        </div>
      </div>
      {/* earn list */}
      <div>
        <p className="mb-[8px] px-[12px] text-[14px] leading-[14px] font-medium text-[#CED1D9]">
          <Trans>Earn</Trans>
        </p>
        <div>
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
          {searchResult?.earnInfo.list?.slice(0, previewLimit).map((item) => (
            <EarnListDataRow
              key={`earn-${item.chainId}-${item.poolId}`}
              item={item}
              onItemClick={() => {}}
            />
          ))}
        </div>
        <div className="px-[12px] py-[12px] leading-[1]">
          <span
            className="text-[12px] font-medium text-[#00E3A5]"
            role="button"
            onClick={() => setSearchTab(SearchTypeEnum.Earn)}
          >{t`查看所有结果(${searchResult.earnInfo?.total || '0'})`}</span>
        </div>
      </div>
    </div>
  )
}
