import { usePoolInfo } from '@/components/Trade/hooks/usePoolInfo'
import { useCallback } from 'react'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { ethers } from 'ethers'
import { FUNDING_FEE_TRACKER_DECIMALS } from '@/constant/decimals'

export const useGetFundingFee = (poolId: string, chainId: number) => {
  const { data: poolInfo } = usePoolInfo({ poolId, chainId })

  const getFundingFee = useCallback(
    (fundingRateIndexEntry: string, size: string, direction: Direction) => {
      const lastFundingFeeTracker = ethers.formatUnits(
        poolInfo?.fundingInfo?.lastFundingFeeTracker ?? 0n,
        FUNDING_FEE_TRACKER_DECIMALS,
      )
      const rate = parseBigNumber(fundingRateIndexEntry).minus(
        parseBigNumber(lastFundingFeeTracker),
      )
      const fundingFee = parseBigNumber(size)
        .mul(rate)
        .mul(parseBigNumber(direction === Direction.LONG ? 1 : -1))

      return fundingFee.toString()
    },
    [poolInfo],
  )

  return {
    getFundingFee,
  }
}
