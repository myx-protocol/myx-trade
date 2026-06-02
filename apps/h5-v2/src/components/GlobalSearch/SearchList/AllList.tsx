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
import Big from 'big.js'

const previewLimit = 3

type ListType = 'futures' | 'cookV2' | 'cook' | 'earn'
const ListTypeArr: Array<ListType> = ['futures', 'cookV2', 'cook', 'earn']

interface LightItem {
  type: ListType
  chainId: number
  poolId: string
  index: number
}

export const AllList = () => {
  const { setSearchTab, searchResult, searchLoading, close } = useGlobalSearchStore()

  const futuresList = useMemo(() => {
    return searchResult?.contractInfo.list?.slice(0, previewLimit)
  }, [searchResult])

  const cookV2List = useMemo(() => {
    return (searchResult as any)?.cookV2Info?.list?.slice(0, previewLimit)
  }, [searchResult])

  const cookList = useMemo(() => {
    return searchResult?.cookInfo.list?.slice(0, previewLimit)
  }, [searchResult])

  const earnList = useMemo(() => {
    return searchResult?.earnInfo.list?.slice(0, previewLimit)
  }, [searchResult])

  const isEmpty =
    !futuresList?.length && !cookV2List?.length && !cookList?.length && !earnList?.length

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

  const [lightItem, setLightItem] = useState<LightItem>({
    type: 'futures',
    chainId: 0,
    poolId: '',
    index: -1,
  })

  const getLightDataList = (type: ListType) => {
    if (type === 'futures') return futuresList?.length ? futuresList : null
    if (type === 'cookV2') return cookV2List?.length ? cookV2List : null
    if (type === 'cook') return cookList?.length ? cookList : null
    if (type === 'earn') return earnList?.length ? earnList : null
    return null
  }

  const getNextLightType = () => {
    const typeIndex = ListTypeArr.indexOf(lightItem.type)
    if (typeIndex === ListTypeArr.length - 1) return ListTypeArr[0]
    return ListTypeArr[typeIndex + 1]
  }

  const getPrevLightType = () => {
    const typeIndex = ListTypeArr.indexOf(lightItem.type)
    if (typeIndex === 0) return ListTypeArr[ListTypeArr.length - 1]
    return ListTypeArr[typeIndex - 1]
  }

  const onLightItemNext = () => {
    if (isEmpty) return null
    const currentDataList = getLightDataList(lightItem.type)
    if (currentDataList?.length && lightItem.index < currentDataList.length - 1) {
      return {
        type: lightItem.type,
        index: lightItem.index + 1,
        item: currentDataList[lightItem.index + 1],
      }
    }
    let nextType: ListType = getNextLightType()
    let nextDataList = getLightDataList(nextType)
    let loopCount = 0
    while (!nextDataList?.length) {
      nextType = getNextLightType()
      nextDataList = getLightDataList(nextType)
      if (loopCount > ListTypeArr.length) return null
      ++loopCount
    }
    if (!nextDataList?.length) return null
    return { type: nextType, index: 0, item: nextDataList[0] }
  }

  const onLightItemPrev = () => {
    if (isEmpty) return null
    const currentDataList = getLightDataList(lightItem.type)
    if (currentDataList?.length && lightItem.index > 0) {
      return {
        type: lightItem.type,
        index: lightItem.index - 1,
        item: currentDataList[lightItem.index - 1],
      }
    }
    let prevType: ListType = getPrevLightType()
    let prevDataList = getLightDataList(prevType)
    let loopCount = 0
    while (!prevDataList?.length) {
      prevType = getPrevLightType()
      prevDataList = getLightDataList(prevType)
      if (loopCount > ListTypeArr.length) return null
      ++loopCount
    }
    if (!prevDataList?.length) return null
    return {
      type: prevType,
      index: prevDataList.length - 1,
      item: prevDataList[prevDataList.length - 1],
    }
  }

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
  if (isEmpty) {
    return <NotFound />
  }

  return (
    <div className="flex flex-[1_1_0%] flex-col gap-[12px] overflow-y-auto">
      {/* contract list */}
      {Big(searchResult?.contractInfo.list?.length || 0).gt(0) && (
        <div>
          <p className="mb-[8px] px-[12px] text-[14px] leading-[14px] font-medium text-[#CED1D9]">
            <Trans>合约</Trans>
          </p>
          <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
            <div className="w-[210px]">
              <span>{t`交易对`}</span>
            </div>
            <div className="flex w-[103px] justify-end">
              <span>{t`最新价/24h涨跌幅`}</span>
            </div>
          </div>
          <div>
            {futuresList?.map((item, index) => (
              <FuturesListDataRow
                isLightMode={lightItem.type === 'futures' && lightItem.index === index}
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
            >{t`查看所有结果(${searchResult?.contractInfo?.total || '0'})`}</span>
          </div>
        </div>
      )}

      {/* cook (cookV2) list */}
      {Big((searchResult as any)?.cookV2Info?.list?.length || 0).gt(0) && (
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
              {cookV2List?.map(
                (item: SearchResultCookItem & { progress?: string }, index: number) => (
                  <CookListDataRow
                    isLightMode={lightItem.type === 'cookV2' && lightItem.index === index}
                    key={`cookV2-${item.chainId}-${item.poolId}`}
                    item={item}
                    variant="cook"
                    onItemClick={toCookPage}
                  />
                ),
              )}
            </div>
            <div className="px-[12px] py-[12px] leading-[1]">
              <span
                className="text-[12px] font-medium text-[#00E3A5]"
                role="button"
                onClick={() => setSearchTab(SearchTypeEnum.Cooking)}
              >{t`查看所有结果(${(searchResult as any)?.cookV2Info?.total || '0'})`}</span>
            </div>
          </div>
        </div>
      )}

      {/* base vault list */}
      {Big(searchResult?.cookInfo.list?.length || 0).gt(0) && (
        <div>
          <p className="mb-[8px] px-[12px] text-[14px] leading-[14px] font-medium text-[#CED1D9]">
            <Trans>Base Vault</Trans>
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
              {cookList?.map((item, index) => (
                <CookListDataRow
                  isLightMode={lightItem.type === 'cook' && lightItem.index === index}
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
              >{t`查看所有结果(${searchResult?.cookInfo?.total || '0'})`}</span>
            </div>
          </div>
        </div>
      )}

      {/* earn list */}
      {Big(searchResult?.earnInfo.list?.length || 0).gt(0) && (
        <div>
          <p className="mb-[8px] px-[12px] text-[14px] leading-[14px] font-medium text-[#CED1D9]">
            <Trans>Stable Vault</Trans>
          </p>
          <div>
            <div className="flex justify-between pt-[8px] pb-[4px] text-[12px] font-normal text-[#6D7180]">
              <div className="w-[210px]">
                <span>{t`交易对`}</span>
              </div>
              <div className="flex w-[103px] justify-end">
                <span>{t`APY`}</span>
              </div>
            </div>
            {earnList?.map((item, index) => (
              <EarnListDataRow
                isLightMode={lightItem.type === 'earn' && lightItem.index === index}
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
            >{t`查看所有结果(${searchResult?.earnInfo?.total || '0'})`}</span>
          </div>
        </div>
      )}
    </div>
  )
}
