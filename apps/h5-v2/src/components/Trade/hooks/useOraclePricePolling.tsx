import { useMarketStore } from '../store/MarketStore'
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChainId, getOraclePrice, type PriceType } from '@myx-trade/sdk'

interface SubscribeToOraclePriceParams {
  poolId: string
}

const ORACLE_PRICE_POLLING_INTERVAL = 5000

export const useOraclePricePolling = () => {
  const marketStore = useMarketStore()

  useQuery({
    queryKey: ['oraclePrice', Array.from(marketStore.watchOraclePoolIdMap.keys())],
    enabled: marketStore.watchOraclePoolIdMap.size > 0,
    queryFn: async () => {
      if (marketStore.watchOraclePoolIdMap.size === 0) return
      const priceRes = await getOraclePrice(
        ChainId.ARB_TESTNET,
        Array.from(marketStore.watchOraclePoolIdMap.keys()),
      )

      marketStore.setOraclePriceDataBatch(
        priceRes.data.reduce(
          (acc, curr) => {
            acc[curr.poolId] = curr
            return acc
          },
          {} as Record<string, PriceType>,
        ),
      )

      return priceRes.data
    },
    refetchInterval: ORACLE_PRICE_POLLING_INTERVAL,
  })

  const subscribeOraclePrice = useCallback(({ poolId }: SubscribeToOraclePriceParams) => {
    marketStore.setwatchOraclePoolIdMap(poolId, true)
  }, [])

  const unsubscribeOraclePrice = useCallback(({ poolId }: SubscribeToOraclePriceParams) => {
    marketStore.setwatchOraclePoolIdMap(poolId, false)
  }, [])

  return {
    unsubscribeOraclePrice,
    subscribeOraclePrice,
  }
}
