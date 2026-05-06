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
import { useCallback, useEffect } from 'react'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useNavigate } from 'react-router-dom'
import { usePoolSymbolsAll } from '@/hooks/pool/usePoolSymbolsAll'
import { FavoritesDefault } from '@/components/FavoritesDefault'

interface FavoritesListProps {
  onFavoritiesDefaultChange?: (bool: boolean) => void
}

export const FavoritesList = ({ onFavoritiesDefaultChange }: FavoritesListProps) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address, isWalletConnected } = useWalletConnection()
  const navigate = useNavigate()
  const marketTickerDataMap = useMarketStore((state) => state.tickerData)

  const { isLoading, data, refetch } = useQuery({
    queryKey: ['home-market-list-favorites', address, isWalletConnected],
    enabled: Boolean(isWalletConnected && address && client && clientIsAuthenticated),
    queryFn: () => {
      return client?.markets.searchMarketAuth(
        {
          chainId: 0,
          searchType: SearchTypeEnum.Contract,
          type: SearchSecondTypeEnum.Favorite,
          searchKey: '',
        },
        address ?? '',
      )
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

  const { symbolDataAllMap } = usePoolSymbolsAll()

  const getSymbol = useCallback(
    (chainId: number, poolId: string) => {
      return symbolDataAllMap[chainId]?.[poolId]
        ? `${symbolDataAllMap[chainId]?.[poolId]?.baseSymbol}${symbolDataAllMap[chainId]?.[poolId]?.quoteSymbol}`
        : '--'
    },
    [symbolDataAllMap],
  )

  if (isLoading) {
    return <MarketListLoading />
  }

  if (!data?.contractInfo?.list?.length) {
    if (data?.contractInfo.favorites.length) {
      onFavoritiesDefaultChange?.(true)
      return (
        <div className="mt-[28px]">
          <FavoritesDefault
            favorites={data.contractInfo.favorites}
            onAddFavoritesSuccess={() => {
              refetch()
            }}
          />
        </div>
      )
    }
    return <Empty />
  }
  onFavoritiesDefaultChange?.(false)

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
              symbol={getSymbol(item.chainId, item.poolId)}
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
