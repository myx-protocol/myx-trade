import { useQuery } from '@tanstack/react-query'
import { pool, parseUnits, COMMON_PRICE_DECIMALS } from '@myx-trade/sdk'
import { useMarketStore } from '../store/MarketStore'

interface usePoolInfoParams {
  poolId?: string
  chainId?: number
}

export const usePoolInfo = ({ poolId, chainId }: usePoolInfoParams) => {
  const poolOraclePrice = useMarketStore((state) => state.oraclePriceData[poolId || ''])
  return useQuery({
    queryKey: ['queryPoolInfo', poolId, chainId],
    enabled: !!poolId && !!poolOraclePrice && !!chainId,
    queryFn: async () => {
      if (!poolId || !chainId) return null
      const poolInfo = await pool.getPoolInfo(
        chainId,
        poolId,
        parseUnits(poolOraclePrice.price, COMMON_PRICE_DECIMALS),
      )
      return poolInfo
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}
