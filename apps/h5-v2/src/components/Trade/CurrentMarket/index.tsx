import { Favorite } from './Favorite'
import { LatestPrice } from './LatestPrice'
import { MarketInfo } from './MarketInfo'
import { SymbolInfo } from './SymbolInfo'
import { useUpdateEffect } from 'ahooks'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useTradePageStore } from '../store/TradePageStore'
import { useMarketStore } from '../store/MarketStore'
import { useSubscription } from '../hooks/useMarketSubscription'
import { useRef } from 'react'
import { useOraclePricePolling } from '../hooks/useOraclePricePolling'

export const CurrentMarket = () => {
  const { client } = useMyxSdkClient()
  const { symbolInfo } = useTradePageStore()
  const { setTickerData } = useMarketStore()
  const { subscribeToTicker } = useSubscription()
  const { subscribeOraclePrice, unsubscribeOraclePrice } = useOraclePricePolling()
  const currentSymbolGlobalIdRef = useRef<number | undefined>(undefined)
  useUpdateEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined
    if (!symbolInfo || symbolInfo.globalId === currentSymbolGlobalIdRef.current) return
    if (client) {
      currentSymbolGlobalIdRef.current = symbolInfo.globalId
      client.markets
        .getTickerList({
          poolIds: [symbolInfo.poolId],
        })
        .then((res) => {
          setTickerData(symbolInfo.poolId, res[0])
          // subscribe oracle price
          subscribeOraclePrice({ poolId: symbolInfo.poolId })
          // subscribe ticker data
          console.log('xd', currentSymbolGlobalIdRef.current, symbolInfo.globalId)
          if (currentSymbolGlobalIdRef.current === symbolInfo.globalId) {
            unsubscribe = subscribeToTicker({
              poolId: symbolInfo.poolId,
              globalId: symbolInfo.globalId,
            })
          }
        })
    }

    return () => {
      console.log('unsubscribe', unsubscribe)
      // unsubscribe oracle price
      unsubscribeOraclePrice({ poolId: symbolInfo.poolId })
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [symbolInfo, client])
  return (
    <div className="no-scrollbar flex w-full items-center overflow-x-auto bg-[#101114] px-[16px] py-[16px]">
      <Favorite />
      <SymbolInfo />
      <LatestPrice />
      <MarketInfo />
    </div>
  )
}
