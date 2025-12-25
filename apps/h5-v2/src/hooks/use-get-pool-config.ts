import useGlobalStore from '@/store/globalStore'
import { useWalletConnection } from './wallet/useWalletConnection'
import useSWR from 'swr'
import { getPoolLevelConfig } from '@/api'

interface PoolConfig {
  level: number
  levelConfig: {
    assetClass: number
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

export const useGetPoolConfig = (targetPoolId?: string, targetChainId?: number) => {
  const { symbolInfo, setMaxLeverage } = useGlobalStore()
  const { chainId } = useWalletConnection()

  const { data: poolConfig } = useSWR(
    (targetPoolId || symbolInfo?.poolId) && (targetChainId || symbolInfo?.chainId)
      ? [
          'getPoolLevelConfig',
          targetPoolId ?? symbolInfo?.poolId,
          targetChainId ?? symbolInfo?.chainId,
        ]
      : null,
    async () => {
      const res = await getPoolLevelConfig(
        targetPoolId ?? (symbolInfo?.poolId as string),
        targetChainId ?? (chainId as number),
      )

      console.log('res-->', res)

      const data = res.data as {
        level: number
        levelConfig: {
          assetClass: number
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
      return data
    },
  )

  return {
    poolConfig: poolConfig as PoolConfig | null,
  }
}
