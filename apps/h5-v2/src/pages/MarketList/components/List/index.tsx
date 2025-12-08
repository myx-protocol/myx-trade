import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Sort } from '@/components/Sort'
import { Trans } from '@lingui/react/macro'
import { useVirtualList } from 'ahooks'
import { useRef } from 'react'
import { Empty } from './Empty'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { formatNumber } from '@/utils/number'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import { useMarketPageStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { SearchSecondTypeEnum, SearchTypeEnum } from '@myx-trade/sdk'
import { Loading } from '@/pages/rank/components/List/Loading'
import { SelectFavoritesToken } from './SelectFavoritesToken'
import { useNavigate } from 'react-router-dom'

export const List = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { chainId, tab } = useMarketPageStore()
  const { client } = useMyxSdkClient()
  const { isLoading, data } = useQuery({
    queryKey: ['market-page-list', chainId, tab],
    enabled: !!client,
    queryFn: async () => {
      const result = await client?.markets.searchMarket({
        chainId,
        searchType: SearchTypeEnum.Contract,
        type: tab,
        searchKey: '',
      })
      return result
    },
  })
  const navigate = useNavigate()
  const [list] = useVirtualList(data?.contractInfo.list ?? [], {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 58,
    overscan: 3,
  })
  // return <SelectFavoritesToken />
  return (
    <div className="mt-[8px] flex min-h-0 flex-[1_1_0%] flex-col">
      {/* header */}
      <MarketListRow
        className="px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
        values={[
          <Sort
            label={
              <p>
                <Trans>Name/Mcap</Trans>
              </p>
            }
          />,
          <Sort
            label={
              <p>
                <Trans>Last Price</Trans>
              </p>
            }
          />,
          <Sort
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
      {Boolean(
        !isLoading && !data?.contractInfo.list.length && tab !== SearchSecondTypeEnum.Favorite,
      ) && <Empty />}
      {Boolean(tab === SearchSecondTypeEnum.Favorite && !isLoading) && <SelectFavoritesToken />}
      {Boolean(
        !isLoading && data?.contractInfo.list.length && tab !== SearchSecondTypeEnum.Favorite,
      ) && (
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
                      {formatNumber(item.data.basePrice, {
                        showUnit: false,
                      })}
                    </p>
                    <p className="text-[12px] font-medium text-[#848E9C]">
                      ${formatNumber(item.data.tvl, {})}
                    </p>
                  </div>,
                  <PriceChangeBlock value={Number(item.data.priceChange)} />,
                ]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
