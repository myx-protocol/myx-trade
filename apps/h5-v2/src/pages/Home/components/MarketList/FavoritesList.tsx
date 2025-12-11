import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { SearchSecondTypeEnum, SearchTypeEnum } from '@myx-trade/sdk'
import { MarketListLoading } from './Loading'
import { Empty } from '@/components/Empty'
import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { SymbolInfo } from '@/components/MarketList/SymbolInfo'
import { formatNumber } from '@/utils/number'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { PriceChangeBlock } from '@/components/MarketList/PriceChangeBlock'
import { useEffect } from 'react'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useNavigate } from 'react-router-dom'

export const FavoritesList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address, isWalletConnected } = useWalletConnection()
  const navigate = useNavigate()
  const marketTickerDataMap = useMarketStore((state) => state.tickerData)

  const { isLoading, data } = useQuery({
    queryKey: ['home-market-list-favorites', address, isWalletConnected],
    enabled: Boolean(isWalletConnected && address && client && clientIsAuthenticated),
    queryFn: () => {
      return client?.markets.searchMarketAuth({
        chainId: 0,
        searchType: SearchTypeEnum.Contract,
        type: SearchSecondTypeEnum.Favorite,
        searchKey: '',
      })
    },
  })
  const { subscribeToTicker } = useSubscription()
  useEffect(() => {
    if (data?.contractInfo?.list?.length && client) {
      const unsubscribe = subscribeToTicker(
        data.contractInfo.list.map((item) => ({
          globalId: item.globalId,
          poolId: item.poolId,
        })),
      )
      return () => {
        if (unsubscribe) {
          unsubscribe()
        }
      }
    }
  }, [data?.contractInfo?.list, client])
  if (isLoading) {
    return <MarketListLoading />
  }

  if (!data?.contractInfo?.list?.length) {
    return <Empty />
  }

  return (
    <div>
      {data.contractInfo.list?.map((item) => (
        <MarketListRow
          className="my-[14px]"
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
