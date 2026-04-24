import { useMemo } from 'react'
import { MarketPoolState } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'

interface UsePairNoTradableParams {
  poolId?: string
  chainId?: number
}

export const usePoolNoTradable = (params: UsePairNoTradableParams) => {
  const { poolId, chainId } = params
  const { client } = useMyxSdkClient()
  const { data: marketDetail, isLoading } = useQuery({
    queryKey: ['marketDetail', chainId, poolId],
    queryFn: async () => {
      if (!client || !poolId || !chainId) return null
      const marketDetail = await client.markets.getMarketDetail({
        chainId,
        poolId,
      })
      return marketDetail
    },
  })
  const isNoTradable = useMemo(() => {
    if (isLoading) return false
    return Boolean(
      marketDetail &&
        marketDetail.state !== MarketPoolState.Trench &&
        marketDetail.state !== MarketPoolState.PreBench,
    )
  }, [marketDetail, isLoading])
  return {
    isNoTradable,
    isLoading,
    marketDetail,
  }
}
