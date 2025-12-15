import { useQuery } from '@tanstack/react-query'
import { getPoolRiskLevelConfig } from '@/request'
import type { ChainId } from '@/config/chain.ts'

export const useGenesisFeeRate = (chainId?: string | number, poolId?: string) => {
  const { data: genesisFeeRate } = useQuery({
    queryKey: [{ key: 'getMarketPoolRiskRate' }, chainId, poolId],
    enabled: !!poolId && !!chainId,
    queryFn: async () => {
      console.log('getMarketPoolRiskRate')
      if (!poolId || !chainId) return ''
      try {
        const result = await getPoolRiskLevelConfig(poolId, +chainId)

        return result?.data?.levelConfig?.genesisFeeRate as string
      } catch (error) {
        return ''
      }
    },
  })
  return genesisFeeRate
}
