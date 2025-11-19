import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { MarketDetailResponse } from '@myx-trade/sdk'
import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo } from 'react'

const CACHE_TIME = 1000 * 60 * 5

interface UseMarketDetailParams {
  poolId?: string
  chainId?: number
}

export const useMarketDetail = (params: UseMarketDetailParams) => {
  const { poolId, chainId } = params
  const { client } = useMyxSdkClient()
  const queryClient = useQueryClient()

  const queryKey = useMemo(() => ['marketDetail', chainId, poolId], [chainId, poolId])
  /**
   * refresh the market detail data
   */
  const refresh = useCallback(async () => {
    if (!client || !poolId || !chainId) return null
    const marketDetail = await client.markets.getMarketDetail({
      chainId,
      poolId,
    })
    // set the data to the cache
    queryClient.setQueryData(queryKey, marketDetail)
    return marketDetail
  }, [client, poolId, chainId, queryClient, queryKey])

  /**
   * get the market detail data
   */
  const getDetail = useCallback(async () => {
    console.log('getDetail-->', client, poolId, chainId)
    if (!client) {
      console.log('client not found')
      return null
    }
    if (!poolId || !chainId) return null
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
    return refresh()
  }, [client, poolId, chainId, refresh, queryClient, queryKey])

  return {
    getDetail,
    refresh,
  }
}
