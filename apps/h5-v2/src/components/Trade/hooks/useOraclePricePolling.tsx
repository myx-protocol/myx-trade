import { useMarketStore } from '../store/MarketStore'
import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getOraclePrice, type PriceType } from '@myx-trade/sdk'

interface SubscribeToOraclePriceParams {
  poolId: string
  chainId: number
}

const ORACLE_PRICE_POLLING_INTERVAL = 5000

export const useOraclePricePolling = () => {
  const marketStore = useMarketStore()
  useQuery({
    queryKey: ['oraclePrice', Array.from(marketStore.watchOraclePoolIdMap.keys())],
    enabled: marketStore.watchOraclePoolIdMap.size > 0,
    queryFn: async () => {
      const chainIdArr = Array.from(marketStore.watchOraclePoolIdMap.keys())
      const requestArr = chainIdArr
        .map((chainId) => {
          return {
            chainId,
            poolIds: Array.from(marketStore.watchOraclePoolIdMap.get(chainId)?.keys() || []),
          }
        })
        .filter((arr) => arr?.poolIds?.length > 0)
      if (requestArr.length === 0) return
      const resultArr = await Promise.allSettled(
        requestArr.map((item) => {
          return getOraclePrice(item.chainId, item.poolIds)
        }),
      )
      const priceRes = resultArr
        .map((item) => {
          return item.status === 'fulfilled' ? item.value : null
        })
        .filter((item) => item !== null)
      const priceData: Record<string, PriceType> = {}
      priceRes.forEach((item) => {
        return item.data.map((item) => {
          priceData[item.poolId] = item
        })
      })

      marketStore.setOraclePriceDataBatch(priceData)

      return priceData
    },
    refetchInterval: ORACLE_PRICE_POLLING_INTERVAL,
  })

  const subscribeOraclePrice = useCallback(({ poolId, chainId }: SubscribeToOraclePriceParams) => {
    marketStore.setwatchOraclePoolIdMap(chainId, poolId, true)
  }, [])

  const unsubscribeOraclePrice = useCallback(
    ({ poolId, chainId }: SubscribeToOraclePriceParams) => {
      marketStore.setwatchOraclePoolIdMap(chainId, poolId, false)
    },
    [],
  )

  return {
    unsubscribeOraclePrice,
    subscribeOraclePrice,
  }
}
