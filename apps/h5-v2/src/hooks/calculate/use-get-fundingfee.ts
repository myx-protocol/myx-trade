import { useCallback } from 'react'
import { Direction } from '@myx-trade/sdk'
import { parseBigNumber } from '@/utils/bn'
import { ethers } from 'ethers'
import { FUNDING_FEE_TRACKER_DECIMALS } from '@/constant/decimals'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import useSWR from 'swr'

export const useGetFundingFee = (poolId: string, chainId: number) => {
  const { client } = useMyxSdkClient(chainId)
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[poolId]?.price ?? 0
  const { data: poolInfo } = useSWR(
    marketPrice && poolId ? { key: 'getPoolFundingFeeInfo', poolId, chainId } : null,
    async () => {
      const rs = await client?.markets.getPoolFundingFeeInfo({
        poolId,
        chainId,
        marketPrice: ethers.parseUnits(marketPrice.toString(), 30).toString(),
      })
      if (rs && 'data' in rs) {
        return rs.data
      }
      return {
        fundingInfo: {
          lastFundingFeeTracker: 0n,
        },
      }
    },
  )

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
