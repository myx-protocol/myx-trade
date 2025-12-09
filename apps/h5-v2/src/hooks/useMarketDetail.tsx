import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { MarketDetailResponse } from '@myx-trade/sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

const CACHE_TIME = 1000 * 60 * 5

interface GetMarketDetailParams {
  poolId?: string
  chainId?: number
}

const getQueryKey = (poolId: string, chainId: number) => {
  return ['marketDetail', chainId, poolId]
}

export const useMarketDetail = () => {
  const queryClient = useQueryClient()
  const { client } = useMyxSdkClient()

  // const queryKey = useMemo(() => ['marketDetail', chainId, poolId], [chainId, poolId])
  /**
   * refresh the market detail data
   */
  const refresh = useCallback(
    async ({ poolId, chainId }: GetMarketDetailParams) => {
      if (!client || !poolId || !chainId) return null
      const marketDetail = await client.markets.getMarketDetail({
        chainId,
        poolId,
      })
      const queryKey = getQueryKey(poolId, chainId)
      // set the data to the cache
      queryClient.setQueryData(queryKey, marketDetail)
      return marketDetail
    },
    [client, queryClient],
  )

  /**
   * get the market detail data
   */
  const getDetail = useCallback(
    async ({ poolId, chainId }: GetMarketDetailParams) => {
      if (!client) {
        return null
      }
      if (!poolId || !chainId) return null
      const queryKey = getQueryKey(poolId, chainId)
      // check if the data is cached
      const cachedData = queryClient.getQueryData<MarketDetailResponse>(queryKey)
      // if cached data is found, check if it's expired
      if (cachedData) {
        const lastUpdated = queryClient.getQueryState<MarketDetailResponse>(queryKey)?.dataUpdatedAt
        const isExpired = lastUpdated && Date.now() - lastUpdated > CACHE_TIME
        //   don't return the cached data if it's expired
        if (!isExpired) return cachedData
        queryClient.removeQueries({ queryKey: queryKey })
      }
      // if not cached, fetch the data
      return refresh({ poolId, chainId })
    },
    [client, queryClient, refresh],
  )

  return {
    getDetail,
    refresh,
    client,
  }
}
