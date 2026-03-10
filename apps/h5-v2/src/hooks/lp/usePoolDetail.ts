import { PoolType } from '@/request/type'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Mode, type PoolInfo } from '@/pages/Cook/type.ts'
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
import {
  getBaseLPDetail,
  getMarketPoolPrice,
  getPoolRiskLevelConfig,
  getQuoteLPDetail,
} from '@/request'
import type { BaseLpDetail, QuoteLpDetail } from '@/request/lp/type.ts'
import Big from 'big.js'
import { FUNDING_FEE_TRACKER_DECIMALS } from '@/constant/decimals.ts'
import type { ChainId } from '@/config/chain.ts'
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
  const baseSize = basePool.poolTokenSupply
  const quoteSize = quotePool.poolTokenSupply

  const lpPrice = basePool.poolTokenPrice
  const quoteLpPrice = quotePool.poolTokenPrice

  const baseTvl = baseSize * lpPrice
  const quoteTvl = quoteSize * quoteLpPrice
  const tvl = formatUnits(baseTvl + quoteTvl, COMMON_LP_AMOUNT_DECIMALS + COMMON_PRICE_DECIMALS)
  /*console.log('tvl:', tvl)
  console.log('basePool.poolTokenSupply:', basePool.poolTokenSupply)
  console.log('basePool.price:', basePool.poolTokenPrice)

  console.log('quotePool.poolTokenSupply:', quotePool.poolTokenSupply)
  console.log('quotePool.poolTokenPrice:', quotePool.poolTokenPrice)*/
  return {
    totalTvl: tvl,
    baseTvl: formatUnits(baseTvl, COMMON_LP_AMOUNT_DECIMALS + COMMON_PRICE_DECIMALS),
    quoteTvl: formatUnits(quoteTvl, COMMON_LP_AMOUNT_DECIMALS + COMMON_PRICE_DECIMALS),
  }
}

export const usePoolRiskConfig = ({
  chainId,
  poolId,
}: {
  chainId?: ChainId | string
  poolId?: string
}) => {
  const { data: riskLevelConfig } = useQuery({
    queryKey: [{ key: 'getMarketPoolRiskRate' }, chainId, poolId],
    enabled: !!poolId && !!chainId,
    queryFn: async () => {
      // console.log('getMarketPoolRiskRate')
      if (!poolId || !chainId) return null
      try {
        const result = await getPoolRiskLevelConfig(poolId, +chainId)

        return result?.data
      } catch (error) {
        return null
      }
    },
    refetchInterval: 1000 * 60,
  })
  return { riskLevelConfig }
}

export const usePoolDetail = (poolType: PoolType) => {
  const { chainId, poolId } = useParams()
  const { client, markets } = useMyxSdkClient()
  const { subscribeToTicker } = useSubscription()
  const currentSymbolGlobalIdRef = useRef<number>(null)
  const { riskLevelConfig } = usePoolRiskConfig({ chainId, poolId })

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

  const { data: poolInfo, refetch: poolInfoRefetch } = useQuery({
    queryKey: [
      { key: poolType === PoolType.quote ? 'getQuoteContractPoolInfo' : 'getBaseContractPoolInfo' },
      poolId,
      chainId,
      tickerData?.price,
      pool,
    ],
    enabled: !!poolId && !!chainId && !!pool,
    queryFn: async () => {
      // console.log(poolId, tickerData?.price)
      if (!poolId || !chainId || !pool) {
        console.error('poolId must be a positive integer')
        return {} as PoolInfo
      }

      let oraclePrice = tickerData?.price || '0'

      if (!tickerData?.price) {
        const res = await getMarketPoolPrice(+chainId, poolId)
        if (res?.data) {
          oraclePrice = res.data
        }
      }

      const result = await Pool.getPoolInfo(
        +chainId,
        poolId,
        parseUnits(oraclePrice, COMMON_PRICE_DECIMALS),
      )

      // console.log(result)
      if (result) {
        const _pool = poolType === PoolType.quote ? result.quotePool : result.basePool
        const info = {
          price: formatUnits(_pool.poolTokenPrice, COMMON_PRICE_DECIMALS),
          exchangeRate: formatUnits(_pool.exchangeRate, COMMON_LP_AMOUNT_DECIMALS),
          tvl: calculationTvl(result),
          fundingInfo: result.fundingInfo,
          oraclePrice: tickerData?.price ?? oraclePrice,
        } as PoolInfo

        return info
      }

      return {} as PoolInfo
    },
    placeholderData: (prev) => prev,
    refetchInterval: 1000 * 10,
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
    if (riskLevelConfig?.levelConfig?.fundingFeeSeconds === 1) {
      return {
        nextFundingRatePercent: Big(nextFundingRatePercent).mul(3600).toString(),
      }
    }
    return {
      nextFundingRatePercent,
    }
  }, [poolInfo?.fundingInfo, riskLevelConfig?.levelConfig?.fundingFeeSeconds])

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
    genesisFeeRate: riskLevelConfig?.levelConfig?.genesisFeeRate || '',
    fundingRate,
    pool,
    poolInfo,
    mode,
    lpDetail,
    refetch,
    poolInfoRefetch,
    markets,
    riskLevelConfig,
  }
}
