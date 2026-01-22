import { EarnList } from './EarnList'
import { useGlobalSearchStore } from '../store'
import {
  SearchTypeEnum,
  type SearchResultContractItem,
  type SearchResultCookItem,
  type SearchResultEarnItem,
} from '@myx-trade/sdk'
import { Trans } from '@lingui/react/macro'
import { NotFound } from './NotFound'
import { SearchListLoading } from './Loading'
import { t } from '@lingui/core/macro'
import { FuturesListDataRow } from './FuturesList/DataRow'
import { CookListDataRow } from './CookList/DataRow'
import { EarnListDataRow } from './EarnList/DataRow'
import { useCallback, useMemo, useState } from 'react'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useDebounceFn, useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useNavigate } from 'react-router-dom'

const previewLimit = 3

export const AllList = () => {
  const { setSearchTab, searchResult, searchLoading, close } = useGlobalSearchStore()

  const futuresList = useMemo(() => {
    return searchResult?.contractInfo.list?.slice(0, previewLimit)
  }, [searchResult])

  interface ActivePool {
    poolId: string
    globalId: number
  }

  const [activePool, setActivePool] = useState<Array<ActivePool>>([])

  const { flush, run } = useDebounceFn(
    () => {
      if (!futuresList) return
      setActivePool(
        futuresList.map((item) => ({
          poolId: item.poolId,
          globalId: item.globalId,
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
  }, [futuresList])

  useUnmount(() => {
    setActivePool([])
  })

  const navigate = useNavigate()

  const toTradePage = useCallback(
    (item: SearchResultContractItem) => {
      close()
      navigate(`/trade/${item.chainId}/${item.poolId}`)
    },
    [navigate, close],
  )

  const toCookPage = useCallback(
    (item: SearchResultCookItem) => {
      close()
      navigate(`/cook/${item.chainId}/${item.poolId}`)
    },
    [navigate, close],
  )

  const toEarnPage = useCallback(
    (item: SearchResultEarnItem) => {
      close()
      navigate(`/earn/${item.chainId}/${item.poolId}`)
    },
    [navigate, close],
  )

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
        <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
          {/* pair */}
          <div className="w-[210px]">
            <span>{t`交易对`}</span>
          </div>
          {/* change 24h */}
          <div className="flex w-[103px] justify-end">
            <span>{t`最新价/24h涨跌幅`}</span>
          </div>
        </div>
        <div>
          {futuresList?.map((item) => (
            <FuturesListDataRow
              key={`futures-${item.chainId}-${item.poolId}`}
              item={item}
              onItemClick={toTradePage}
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
          <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
            <div className="w-[210px]">
              <span>{t`交易对`}</span>
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
                onItemClick={toCookPage}
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
          <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
            <div className="w-[210px]">
              <span>{t`交易对`}</span>
            </div>
            <div className="flex w-[103px] justify-end">
              <span>{t`APR`}</span>
            </div>
          </div>
          {searchResult?.earnInfo.list?.slice(0, previewLimit).map((item) => (
            <EarnListDataRow
              key={`earn-${item.chainId}-${item.poolId}`}
              item={item}
              onItemClick={toEarnPage}
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
