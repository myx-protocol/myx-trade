import { ArrowRight } from '@/components/Icon'
import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { ChainId } from '@/config/chain'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import clsx from 'clsx'
import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { MarketListLoading } from './Loading'
import { Empty } from '@/components/Empty'
import { useQuery } from '@tanstack/react-query'
import { getLeaderboard, type LeaderboardSortField } from '@/api'
import { useUpdateEffect } from 'ahooks'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'

type TabMarketValue = 'Favorites' | 'Hot' | 'Gainers' | 'New'

export const MarketList = () => {
  const MARKET_LIST: Array<{ value: TabMarketValue; label: ReactNode }> = useMemo(() => {
    return [
      {
        value: 'Favorites',
        label: <Trans>Favorites</Trans>,
      },
      {
        value: 'Hot',
        label: <Trans>Hot</Trans>,
      },
      {
        value: 'Gainers',
        label: <Trans>Gainers</Trans>,
      },
      {
        value: 'New',
        label: <Trans>New</Trans>,
      },
    ]
  }, [])
  const [activeMarket, setActiveMarket] = useState<TabMarketValue>('Hot')
  const { isLoading, data } = useQuery({
    queryKey: ['home-market-list', activeMarket],
    queryFn: () => {
      if (activeMarket === 'Favorites') {
        return null
      }
      let sortField: LeaderboardSortField | undefined = undefined
      switch (activeMarket) {
        case 'Hot':
          sortField = 'tokenCreateTime'
          break
        case 'Gainers':
          sortField = 'topGainers'
          break
        case 'New':
          sortField = 'tokenCreateTime'
          break
      }
      if (!sortField) {
        return null
      }
      return getLeaderboard({
        sortField: sortField as LeaderboardSortField,
      })
    },
  })

  const { client } = useMyxSdkClient()
  const websocketSubScribe = useSubscription()

  useUpdateEffect(() => {
    if (data?.data?.length && client) {
      // subscribe ticker data
      // websocketSubScribe.subscribeToTicker(data.data.map(item))
    }
  }, [client, data])
  return (
    <div className="mt-[24px] w-full px-[16px]">
      {/* header */}
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-[1_1_0%] items-center justify-start gap-[24px] overflow-x-auto overflow-y-hidden text-[16px] font-medium text-[#848E9C]">
          {MARKET_LIST.map((item) => (
            <div
              key={item.value}
              role="button"
              className={clsx('transition-all duration-100', {
                'font-bold text-white': activeMarket === item.value,
              })}
              onClick={() => setActiveMarket(item.value)}
            >
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <Link to="/rank">
          <div role=" button" className="shrink-0">
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>

      {/* list header */}
      <div className="mt-[20px] w-full text-[12px] leading-[1.2] text-[#848E9C]">
        <MarketListRow
          values={[<Trans>Name</Trans>, <Trans>Last Price</Trans>, <Trans>Change %</Trans>]}
        />
      </div>
      {isLoading && <MarketListLoading />}
      {!isLoading && !data?.data?.length && <Empty />}
      {/* list body */}
      {/* <MarketListLoading /> */}
      <div>
        {data?.data?.map((item) => (
          <MarketListRow
            className="my-[14px]"
            key={item.poolId}
            values={[
              <SymbolInfo
                symbol={item.baseQuoteSymbol}
                baseTokenLogo={item.tokenIcon}
                chainId={item.chainId}
              />,
              <p className="text-[14px] font-medium text-[#fff]">
                {formatNumber(item.basePrice, {
                  showUnit: false,
                })}
              </p>,
              <PriceChangeBlock value={Number(item.priceChange) || 0} />,
            ]}
          />
        ))}
      </div>
    </div>
  )
}
