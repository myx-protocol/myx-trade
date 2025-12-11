import { PoolContext } from '@/pages/Earn/context.ts'
import {
  COMMON_PRICE_DECIMALS,
  formatUnits,
  pool as Pool,
  parseUnits,
  COMMON_LP_AMOUNT_DECIMALS,
} from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { getPoolRiskLevelConfig, getQuoteLPDetail } from '@/request'
import { useParams } from 'react-router-dom'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { Mode, type PoolInfo } from '@/pages/Cook/type.ts'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { useUpdateEffect } from 'ahooks'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription.ts'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { client } = useMyxSdkClient()
  const { subscribeToTicker } = useSubscription()
  const currentSymbolGlobalIdRef = useRef<number>(null)
  const prevPriceRef = useRef<string | undefined>(undefined)
  const [mode, setMode] = useState<Mode>(Mode.Rise)

  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const { data: quoteLpDetail, refetch } = useQuery({
    queryKey: [{ key: 'QuotePoolDetail' }, chainId, poolId],
    queryFn: async () => {
      if (!chainId || !poolId) return {} as QuoteLpDetail
      const response = await getQuoteLPDetail(chainId as unknown as number, poolId)
      if (response.data) {
        return response.data
      }
      return {} as QuoteLpDetail
    },
  })

  const { data: pool } = useQuery({
    queryKey: [{ key: 'pool_detail_by_poolId' }, poolId, chainId],
    queryFn: async () => {
      if (!poolId || !chainId) return undefined
      const result = await Pool.getPoolDetail(+chainId, poolId)

      return result
    },
  })

  /*const { data: price } = useQuery({
    queryKey: [{ key: 'getQuotePoolPrice' }, poolId, chainId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId || !chainId) return ''
      const result = await Quote.getLpPrice(+chainId, poolId)
      console.log(result)
      if (result) {
        return formatUnits(result, COMMON_PRICE_DECIMALS)
      }
      return ''
    },
    refetchInterval: 5000,
  })*/

  const { data: poolInfo } = useQuery({
    queryKey: [{ key: 'getBasePoolExchangeRate' }, poolId, chainId, tickerData?.price],
    enabled: !!poolId && !!chainId && !!tickerData?.price,
    queryFn: async () => {
      console.log(poolId, tickerData?.price)
      if (!poolId || !chainId || !tickerData?.price) {
        console.error('poolId must be a positive integer')
        return {} as PoolInfo
      }
      const result = await Pool.getPoolInfo(
        +chainId,
        poolId,
        parseUnits(tickerData?.price, COMMON_PRICE_DECIMALS),
      )
      if (result) {
        const info = {
          price: formatUnits(result.quotePool.poolTokenPrice, COMMON_PRICE_DECIMALS),
          exchangeRate: formatUnits(result.quotePool.exchangeRate, COMMON_LP_AMOUNT_DECIMALS),
        } as PoolInfo

        console.log('pool price:', info.price)
        console.log('pool exchangeRate:', info.exchangeRate)

        return info
      }

      return {} as PoolInfo
    },
    placeholderData: (prev) => prev, // ⭐ v5 推荐写法
  })

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

  useUpdateEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined
    if (!poolId || !quoteLpDetail?.globalId) return
    if (client) {
      currentSymbolGlobalIdRef.current = quoteLpDetail?.globalId
      // subscribe ticker data
      if (currentSymbolGlobalIdRef.current === quoteLpDetail?.globalId) {
        unsubscribe = subscribeToTicker({
          poolId: poolId,
          globalId: quoteLpDetail.globalId,
        })
      }
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [poolId, client, quoteLpDetail?.globalId])

  useEffect(() => {
    if (poolInfo?.price !== prevPriceRef.current) {
      setMode(Number(poolInfo?.price) >= Number(prevPriceRef.current || '') ? Mode.Rise : Mode.Fall)
      prevPriceRef.current = poolInfo?.price
    }
  }, [poolInfo?.price])

  return (
    <PoolContext.Provider
      value={{
        chainId: Number(chainId),
        poolId: poolId as string,
        pool,
        price: poolInfo?.price,
        quoteLpDetail,
        refetch,
        genesisFeeRate,
        exchangeRate: poolInfo?.exchangeRate,
        mode,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
