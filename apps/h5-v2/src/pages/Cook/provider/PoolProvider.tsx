import { type ReactNode, useRef } from 'react'
import { PoolContext } from '@/pages/Cook/context.ts'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { COMMON_PRICE_DECIMALS, formatUnits, base as Base, pool as Pool } from '@myx-trade/sdk'
import type { BaseLpDetail } from '@/request/lp/type.ts'
import { getBaseLPDetail } from '@/request'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription.ts'
import { useOraclePricePolling } from '@/components/Trade/hooks/useOraclePricePolling.tsx'
import { useUpdateEffect } from 'ahooks'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { client } = useMyxSdkClient()
  const { subscribeToTicker } = useSubscription()
  const currentSymbolGlobalIdRef = useRef<number>(null)
  const { data: price } = useQuery({
    queryKey: [{ key: 'quoteLpPrice' }, poolId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId || !chainId) return ''
      const result = await Base.getLpPrice(+chainId, poolId)

      if (result) {
        return formatUnits(result, COMMON_PRICE_DECIMALS)
      }
      return ''
    },
    refetchInterval: 5000,
  })
  const { data: pool } = useQuery({
    queryKey: [{ key: 'pool_detail_by_poolId' }, poolId, chainId],
    queryFn: async () => {
      if (!poolId || !chainId) return undefined
      const result = await Pool.getPoolDetail(+chainId, poolId)

      return result
    },
  })

  const { data: baseLpDetail } = useQuery({
    queryKey: [{ key: 'BasePoolDetail' }, chainId, poolId],
    queryFn: async () => {
      if (!chainId || !poolId) return {} as BaseLpDetail
      const response = await getBaseLPDetail(chainId as unknown as number, poolId)
      if (response.data) {
        return response.data
      }
      return {} as BaseLpDetail
    },
  })

  useUpdateEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined
    if (!poolId || !baseLpDetail?.globalId) return
    if (client) {
      currentSymbolGlobalIdRef.current = baseLpDetail?.globalId
      // subscribe ticker data
      if (currentSymbolGlobalIdRef.current === baseLpDetail?.globalId) {
        unsubscribe = subscribeToTicker({
          poolId: poolId,
          globalId: baseLpDetail.globalId,
        })
      }
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [poolId, client, baseLpDetail?.globalId])

  return (
    <PoolContext.Provider
      value={{ chainId: Number(chainId), poolId: poolId as string, pool, price, baseLpDetail }}
    >
      {children}
    </PoolContext.Provider>
  )
}
