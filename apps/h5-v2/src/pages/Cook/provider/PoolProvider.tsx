import { type ReactNode, useEffect, useRef, useState } from 'react'
import { PoolContext } from '@/pages/Cook/context.ts'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  COMMON_PRICE_DECIMALS,
  formatUnits,
  base as Base,
  pool as Pool,
  COMMON_LP_AMOUNT_DECIMALS,
} from '@myx-trade/sdk'
import type { BaseLpDetail } from '@/request/lp/type.ts'
import { getBaseLPDetail, getPoolRiskLevelConfig } from '@/request'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription.ts'
import { useUpdateEffect } from 'ahooks'
import { Mode, type PoolInfo } from '../type'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { parseUnits } from 'ethers'
import { useGenesisFeeRate } from '@/hooks/lp/useGenesisFeeRate.ts'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const genesisFeeRate = useGenesisFeeRate(chainId, poolId)
  const { client } = useMyxSdkClient()
  const { subscribeToTicker } = useSubscription()

  const currentSymbolGlobalIdRef = useRef<number>(null)
  const prevPriceRef = useRef<string | undefined>(undefined)
  const [mode, setMode] = useState<Mode>(Mode.Rise)
  const [refreshAssetKey, setRefreshAssetKey] = useState(Date.now())
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const refreshAsset = async () => {
    setRefreshAssetKey(Date.now())
  }

  // const { data: price } = useQuery({
  //   queryKey: [{ key: 'getBasePoolInfo' }, poolId, chainId],
  //   enabled: !!poolId && !!chainId,
  //   queryFn: async () => {
  //     if (!poolId || !chainId) return ''
  //     const result = await Base.getLpPrice(+chainId, poolId)
  //     console.log(result)
  //
  //     if (result) {
  //       return formatUnits(result, COMMON_PRICE_DECIMALS)
  //     }
  //     return ''
  //   },
  //   refetchInterval: 5000,
  // })

  const { data: poolInfo } = useQuery({
    queryKey: [{ key: 'getBasePoolExchangeRate' }, poolId, chainId],
    enabled: !!poolId && !!chainId,
    queryFn: async () => {
      console.log(poolId, tickerData?.price)
      if (!poolId || !chainId) {
        console.error('poolId must be a positive integer')
        return {} as PoolInfo
      }

      const result = await Pool.getPoolInfo(
        +chainId,
        poolId,
        parseUnits(tickerData?.price || '0', COMMON_PRICE_DECIMALS),
      )

      if (result) {
        const info = {
          price: formatUnits(result.basePool.poolTokenPrice, COMMON_PRICE_DECIMALS),
          exchangeRate: formatUnits(result.basePool.exchangeRate, COMMON_LP_AMOUNT_DECIMALS),
        } as PoolInfo

        console.log('pool price:', info.price)
        console.log('pool exchangeRate:', info.exchangeRate)

        return info
      }

      return {} as PoolInfo
    },
    placeholderData: (prev) => prev, // ⭐ v5 推荐写法
  })

  const { data: pool } = useQuery({
    queryKey: [{ key: 'pool_detail_by_poolId' }, poolId, chainId],
    queryFn: async () => {
      if (!poolId || !chainId) return undefined
      const result = await Pool.getPoolDetail(+chainId, poolId)

      return result
    },
  })

  const { data: baseLpDetail, refetch } = useQuery({
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

  useEffect(() => {
    if (poolInfo?.price !== prevPriceRef.current) {
      setMode(Number(poolInfo?.price) >= Number(prevPriceRef.current || '') ? Mode.Rise : Mode.Fall)
      prevPriceRef.current = poolInfo?.price
    }
  }, [poolInfo?.price])

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
      value={{
        chainId: Number(chainId),
        poolId: poolId as string,
        pool,
        price: poolInfo?.price,
        baseLpDetail,
        refetch,
        mode,
        genesisFeeRate,
        refreshAssetKey,
        refreshAsset,
        exchangeRate: poolInfo?.exchangeRate,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
