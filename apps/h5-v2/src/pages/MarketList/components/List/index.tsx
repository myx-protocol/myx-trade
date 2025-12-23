import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Sort } from '@/components/Sort'
import { Trans } from '@lingui/react/macro'
import { useVirtualList } from 'ahooks'
import { useEffect, useRef } from 'react'
import { Empty } from './Empty'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { formatNumber } from '@/utils/number'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import { useMarketPageStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { SearchSecondTypeEnum, SearchTypeEnum, type SearchMarketParams } from '@myx-trade/sdk'
import { Loading } from '@/pages/rank/components/List/Loading'
import { useNavigate } from 'react-router-dom'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useSortData } from '@/hooks/useSortData'

export const List = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { chainId, tab, sort, setSort } = useMarketPageStore()
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { isWalletConnected, address } = useWalletConnection()
  const { isLoading, data } = useQuery({
    queryKey: ['market-page-list', chainId, tab, isWalletConnected, address, clientIsAuthenticated],
    enabled: !!client,
    queryFn: async () => {
      const params: SearchMarketParams = {
        chainId,
        searchType: SearchTypeEnum.Contract,
        type: tab,
        searchKey: '',
      }
      let result = null
      if (tab === SearchSecondTypeEnum.Favorite && !isWalletConnected) {
        return null
      }
      if (isWalletConnected) {
        result = await client?.markets.searchMarketAuth(params, address ?? '')
      } else {
        result = await client?.markets.searchMarket(params)
      }
      return result
    },
  })

  const marketTickerDataMap = useMarketStore((state) => state.tickerData)

  // 使用排序 hook，只在用户点击排序时触发，ticker 数据变化不会重新排序
  const dataSorted = useSortData({
    data: data?.contractInfo.list ?? [],
    sort: {
      by: sort.by,
      direction: sort.direction,
    },
    getFieldValue: (item, field) => {
      // 对于 basePrice 和 priceChange，使用 ticker 数据，如果没有则使用原值
      if (field === 'basePrice') {
        return marketTickerDataMap[item.poolId]?.price || item.basePrice
      }
      if (field === 'priceChange') {
        return marketTickerDataMap[item.poolId]?.change || item.priceChange
      }
      // 其他字段使用原值
      return item[field] as string | number | undefined
    },
  })

  const navigate = useNavigate()
  const [list] = useVirtualList(dataSorted, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 58,
    overscan: 3,
  })

  const { subscribeToTicker } = useSubscription()
  useEffect(() => {
    if (client && list.length && dataSorted.length) {
      const unsubscribe = subscribeToTicker(
        list.map((item) => ({
          globalId: item.data.globalId,
          poolId: item.data.poolId,
        })),
      )
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    }
  }, [list, client, dataSorted.length, subscribeToTicker])

  // return <SelectFavoritesToken />
  return (
    <div className="mt-[8px] flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <MarketListRow
        className="px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
        values={[
          <Sort
            onChange={(direction) =>
              setSort({
                by: direction === 'none' ? undefined : 'marketCap',
                direction,
              })
            }
            isSorted={sort.by === 'marketCap'}
            label={
              <p>
                <Trans>Name/Mcap</Trans>
              </p>
            }
          />,
          <Sort
            onChange={(direction) =>
              setSort({
                by: direction === 'none' ? undefined : 'basePrice',
                direction,
              })
            }
            isSorted={sort.by === 'basePrice'}
            label={
              <p>
                <Trans>Last Price</Trans>
              </p>
            }
          />,
          <Sort
            onChange={(direction) =>
              setSort({
                by: direction === 'none' ? undefined : 'priceChange',
                direction,
              })
            }
            isSorted={sort.by === 'priceChange'}
            label={
              <p>
                <Trans>Change %</Trans>
              </p>
            }
          />,
        ]}
      />

      {/* list */}
      {isLoading && <Loading total={10} />}
      {Boolean(!isLoading && !dataSorted.length) && <Empty />}
      {Boolean(!isLoading && dataSorted.length) && (
        <div className="min-h-0 flex-[1_1_0%] overflow-y-auto" ref={containerRef}>
          <div ref={wrapperRef} className="min-h-0 pb-[10px]">
            {list?.map((item) => (
              <MarketListRow
                key={item.index}
                className="h-[58px] px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
                onClick={() => {
                  navigate(`/price/${item.data.chainId}/${item.data.poolId}`)
                }}
                values={[
                  <SymbolInfo
                    symbol={`${item.data.baseSymbol}${item.data.quoteSymbol}`}
                    descriptionText={formatNumber(item.data.marketCap)}
                    baseLogoSize={28}
                    quoteTokenSize={10}
                    baseTokenLogo={item.data.tokenIcon}
                    chainId={item.data.chainId}
                  />,
                  <div className="flex flex-col items-end justify-center">
                    <p className="text-[14px] font-medium text-white">
                      {formatNumber(
                        marketTickerDataMap[item.data.poolId]?.price || item.data.basePrice,
                        {
                          showUnit: false,
                        },
                      )}
                    </p>
                    <p className="text-[12px] font-medium text-[#848E9C]">
                      ${formatNumber(item.data.tvl, {})}
                    </p>
                  </div>,
                  <PriceChangeBlock
                    value={
                      Number(
                        marketTickerDataMap[item.data.poolId]?.change || item.data.priceChange,
                      ) || 0
                    }
                  />,
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
