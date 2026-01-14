import { PoolType } from '@/request/type'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Mode, type PoolInfo } from '@/pages/Cook/type.ts'
import { useUpdateEffect } from 'ahooks'
import { useQuery } from '@tanstack/react-query'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useParams } from 'react-router-dom'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider.tsx'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription.ts'
import {
  COMMON_LP_AMOUNT_DECIMALS,
  COMMON_PRICE_DECIMALS,
  formatUnits,
  parseUnits,
  pool as Pool,
} from '@myx-trade/sdk'
import { getBaseLPDetail, getPoolRiskLevelConfig, getQuoteLPDetail } from '@/request'
import type { BaseLpDetail, QuoteLpDetail } from '@/request/lp/type.ts'
import { FUNDING_FEE_TRACKER_DECIMALS } from '@/constant/decimals.ts'
import Big from 'big.js'
type BaseQuotePoolInfo = {
  poolToken: string
  poolTokenSupply: bigint
  exchangeRate: bigint
  poolTokenPrice: bigint
}
function calculationTvl<T extends { basePool: BaseQuotePoolInfo; quotePool: BaseQuotePoolInfo }>(
  poolInfo: T,
) {
  const { basePool, quotePool } = poolInfo
  const baseSize = basePool.poolTokenSupply * basePool.exchangeRate
  const quoteSize = quotePool.poolTokenSupply * quotePool.exchangeRate
  const lpPrice = basePool.poolTokenPrice
  const quoteLpPrice = quotePool.poolTokenPrice
  const baseTvl = baseSize * lpPrice
  const quoteTvl = quoteSize * quoteLpPrice
  return formatUnits(baseTvl + quoteTvl, COMMON_LP_AMOUNT_DECIMALS * 2 + COMMON_PRICE_DECIMALS)
}

export const usePoolDetail = (poolType: PoolType) => {
  const { chainId, poolId } = useParams()
  const { client, markets } = useMyxSdkClient()
  const { subscribeToTicker } = useSubscription()
  const currentSymbolGlobalIdRef = useRef<number>(null)

  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const prevPriceRef = useRef<string | undefined>(undefined)
  const [mode, setMode] = useState<Mode>(Mode.Rise)

  const { data: lpDetail, refetch } = useQuery({
    queryKey: [
      { key: poolType === PoolType.quote ? 'getQuotePoolDetail' : 'getBasePoolDetail' },
      chainId,
      poolId,
    ],
    queryFn: async () => {
      if (!chainId || !poolId) return {} as QuoteLpDetail
      const fun = poolType === PoolType.quote ? getQuoteLPDetail : getBaseLPDetail
      const response = await fun(chainId as unknown as number, poolId)
      if (response.data) {
        return response.data
      }
      if (poolType === PoolType.quote) return {} as QuoteLpDetail
      return {} as BaseLpDetail
    },
    placeholderData: (prev) => prev,
  })

  const { data: poolInfo, refetch: poolInfoRefetch } = useQuery({
    queryKey: [
      { key: poolType === PoolType.quote ? 'getQuoteContractPoolInfo' : 'getBaseContractPoolInfo' },
      poolId,
      chainId,
      tickerData?.price,
    ],
    enabled: !!poolId && !!chainId,
    queryFn: async () => {
      // console.log(poolId, tickerData?.price)
      if (!poolId || !chainId) {
        console.error('poolId must be a positive integer')
        return null
      }

      try {
        const result = await Pool.getPoolInfo(
          +chainId,
          poolId,
          parseUnits(tickerData?.price || '0', COMMON_PRICE_DECIMALS),
        )

        // console.log(result)
        if (result) {
          const _pool = poolType === PoolType.quote ? result.quotePool : result.basePool
          const info = {
            price: formatUnits(_pool.poolTokenPrice, COMMON_PRICE_DECIMALS),
            exchangeRate: formatUnits(_pool.exchangeRate, COMMON_LP_AMOUNT_DECIMALS),
            tvl: calculationTvl(result),
            fundingInfo: result.fundingInfo,
          } as PoolInfo

          return info
        }
      } catch (error) {
        console.error(error)
        return null
      }
    },
    placeholderData: (prev) => prev,
    refetchInterval: 1000 * 10,
  })

  const { data: pool } = useQuery({
    queryKey: [{ key: 'pool_detail_by_poolId' }, poolId, chainId, markets?.length],
    enabled: Boolean(poolId && chainId && markets?.length),
    queryFn: async () => {
      if (chainId && poolId) {
        const result = await Pool.getPoolDetail(+chainId, poolId)
        return result
      }
    },
  })

  const { data: levelConfig } = useQuery({
    queryKey: [{ key: 'getMarketPoolRiskRate' }, chainId, poolId],
    enabled: !!poolId && !!chainId,
    queryFn: async () => {
      // console.log('getMarketPoolRiskRate')
      if (!poolId || !chainId) return null
      try {
        const result = await getPoolRiskLevelConfig(poolId, +chainId)

        return result?.data?.levelConfig
      } catch (error) {
        return null
      }
    },
  })

  useEffect(() => {
    if (poolInfo?.price !== prevPriceRef.current) {
      setMode(Number(poolInfo?.price) >= Number(prevPriceRef.current || '') ? Mode.Rise : Mode.Fall)
      prevPriceRef.current = poolInfo?.price
    }
  }, [poolInfo?.price])

  const fundingRate = useMemo(() => {
    const fundingInfo = poolInfo?.fundingInfo
    if (!fundingInfo) return
    const nextFundingRatePercent = Big(
      formatUnits(fundingInfo.nextFundingRate, FUNDING_FEE_TRACKER_DECIMALS),
    ).toString()

    // if fundingFeeSeconds is 1, return hourly funding rate
    if (levelConfig?.fundingFeeSeconds === 1) {
      // console.log('fundingRate:', Big(nextFundingRatePercent).mul(3600).toString())
      return {
        nextFundingRatePercent: Big(nextFundingRatePercent).mul(3600).toString(),
      }
    }
    // console.log('fundingRate:', nextFundingRatePercent)

    return {
      nextFundingRatePercent,
    }
  }, [poolInfo?.fundingInfo, levelConfig?.fundingFeeSeconds])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined
    if (!poolId || !lpDetail?.globalId) return
    try {
      currentSymbolGlobalIdRef.current = lpDetail?.globalId
      // subscribe ticker data
      if (currentSymbolGlobalIdRef.current === lpDetail?.globalId) {
        unsubscribe = subscribeToTicker({
          poolId: poolId,
          globalId: lpDetail.globalId,
        })
      }
    } catch (error) {
      console.error(error)
    }

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [poolId, lpDetail?.globalId, subscribeToTicker])

  return {
    genesisFeeRate: levelConfig?.genesisFeeRate,
    fundingRate,
    pool,
    poolInfo,
    mode,
    lpDetail,
    refetch,
    poolInfoRefetch,
  }
}
