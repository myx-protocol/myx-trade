import { type ReactNode, useState } from 'react'
import { PoolContext } from '@/pages/Cook/context.ts'
import { useParams } from 'react-router-dom'
import type { BaseLpDetail } from '@/request/lp/type.ts'
import { usePoolDetail } from '@/hooks/lp/usePoolDetail.ts'
import { PoolType } from '@/request/type.ts'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { pool, poolInfo, mode, genesisFeeRate, refetch, lpDetail, poolInfoRefetch } =
    usePoolDetail(PoolType.base)

  const [refreshAssetKey, setRefreshAssetKey] = useState(Date.now())

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
        baseLpDetail: lpDetail as BaseLpDetail,
        refetch,
        mode,
        genesisFeeRate,
        refreshAssetKey,
        refreshAsset,
        exchangeRate: poolInfo?.exchangeRate,
        tvl: poolInfo?.tvl,
        poolInfoRefetch,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
