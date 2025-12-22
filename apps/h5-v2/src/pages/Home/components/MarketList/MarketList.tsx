import { getLeaderboard, type LeaderboardSortField } from '@/api'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { MarketListLoading } from './Loading'
import { Empty } from '@/components/Empty'
import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { formatNumber } from '@/utils/number'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useNavigate } from 'react-router-dom'

interface MarketListProps {
  activeMarket: 'Favorites' | 'Hot' | 'Gainers' | 'New'
}

export const MarketList = ({ activeMarket }: MarketListProps) => {
  const navigate = useNavigate()
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
  const marketTickerDataMap = useMarketStore((state) => state.tickerData)

  const websocketSubScribe = useSubscription()

  useEffect(() => {
    if (data?.data?.length && client) {
      // subscribe ticker data
      const params = data.data.map((item) => ({
        globalId: item.globalId,
        poolId: item.poolId,
      }))
      const unsubscribe = websocketSubScribe.subscribeToTicker(params)
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe()
        }
      }
    }
  }, [client, data])

  if (isLoading) {
    return <MarketListLoading />
  }

  if (!data?.data?.length) {
    return <Empty />
  }
  return (
    <div>
      {data?.data?.map((item) => (
        <MarketListRow
          className="py-[16px]"
          key={item.poolId}
          onClick={() => {
            navigate(`/price/${item.chainId}/${item.poolId}`)
          }}
          values={[
            <SymbolInfo
              symbol={item.baseQuoteSymbol}
              baseTokenLogo={item.tokenIcon}
              chainId={item.chainId}
            />,
            <p className="text-[14px] font-medium text-[#fff]">
              {formatNumber(marketTickerDataMap[item.poolId]?.price || item.basePrice, {
                showUnit: false,
              })}
            </p>,
            <PriceChangeBlock
              value={Number(marketTickerDataMap[item.poolId]?.change || item.priceChange) || 0}
            />,
          ]}
        />
      ))}
    </div>
  )
}
