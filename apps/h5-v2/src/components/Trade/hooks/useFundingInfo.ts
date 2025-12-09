import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { usePoolInfo } from './usePoolInfo'
import { useMemo } from 'react'
import { formatUnits } from 'ethers'
import { FUNDING_FEE_TRACKER_DECIMALS } from '@/constant/decimals'
import Big from 'big.js'
import { useCountDown } from 'ahooks'
import dayjs from 'dayjs'

interface UseFundingInfoProps {
  poolId?: string
  chainId?: number
}

export const useFundingInfo = ({ poolId, chainId }: UseFundingInfoProps) => {
  const { data: poolInfo } = usePoolInfo({
    poolId,
    chainId,
  })

  const { poolConfig } = useGetPoolConfig(poolId, chainId)

  const fundingInfo = useMemo(() => {
    const fundingInfo = poolInfo?.fundingInfo
    if (!fundingInfo) return
    const nextFundingRatePercent = Big(
      formatUnits(fundingInfo.nextFundingRate, FUNDING_FEE_TRACKER_DECIMALS),
    ).toString()

    // if fundingFeeSeconds is 1, return hourly funding rate
    if (poolConfig?.levelConfig?.fundingFeeSeconds === 1) {
      return {
        nextFundingRatePercent: Big(nextFundingRatePercent).mul(3600).toString(),
      }
    }
    return {
      nextFundingRatePercent,
    }
  }, [poolInfo?.fundingInfo, poolConfig?.levelConfig?.fundingFeeSeconds])

  // countdown
  const isShowCountdown = useMemo(() => {
    return (
      poolConfig?.levelConfig.fundingFeeSeconds && poolConfig.levelConfig.fundingFeeSeconds > 10
    )
  }, [poolConfig?.levelConfig?.fundingFeeSeconds])

  const [, formattedCountdown] = useCountDown({
    targetDate: dayjs.unix(Number(poolInfo?.fundingInfo?.nextEpochTime) || 0).toDate(),
  })

  const countdownLabel = useMemo(() => {
    if (isShowCountdown) {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${pad(formattedCountdown.hours)}:${pad(formattedCountdown.minutes)}:${pad(formattedCountdown.seconds)}`
    }
    return '--'
  }, [isShowCountdown, formattedCountdown])

  // console.log(countdownLabel, isShowCountdown, formattedCountdown)

  return {
    fundingInfo,
    isShowCountdown,
    countdownLabel,
  }
}
