import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import { useWalletConnection } from './wallet/useWalletConnection'
import useSWR from 'swr'
import { getPoolLevelConfig } from '@/api'
import { useState } from 'react'

export const useGetPoolConfig = () => {
  const { symbolInfo, setMaxLeverage } = useTradePageStore()
  const { chainId } = useWalletConnection()

  const [poolConfig, setPoolConfig] = useState<{
    level: number
    levelConfig: {
      fundingFeeRate1: number
      fundingFeeRate1Max: number
      fundingFeeRate2: number
      fundingFeeSeconds: number
      leverage: number
      lockLiquidity: number
      lockPriceRate: number
      lockSeconds: number
      maintainCollateralRate: number
      minOrderSizeInUsd: number
      name: string
      slip: number
    }
    levelName: string
  } | null>(null)

  useSWR(['getPoolLevelConfig', symbolInfo?.poolId, symbolInfo?.chainId], async () => {
    const res = await getPoolLevelConfig(symbolInfo?.poolId as string, chainId as number)
    const data = res.data as {
      level: number
      levelConfig: {
        fundingFeeRate1: number
        fundingFeeRate1Max: number
        fundingFeeRate2: number
        fundingFeeSeconds: number
        leverage: number
        lockLiquidity: number
        lockPriceRate: number
        lockSeconds: number
        maintainCollateralRate: number
        minOrderSizeInUsd: number
        name: string
        slip: number
      }
      levelName: string
    }

    setMaxLeverage(data.levelConfig?.leverage ?? 10)
    setPoolConfig(data)
    return data
  })

  return {
    poolConfig,
  }
}
