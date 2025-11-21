import { useCallback } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { parseBigNumber } from '@/utils/bn'
import { TRADING_FEE_DECIMALS } from '@/constant/decimals'
import { ethers } from 'ethers'

export const useGetTradingFee = () => {
  const { client } = useMyxSdkClient()
  const getTradingFee = useCallback(
    async ({ size, price, assetClass }: { size: string; price: string; assetClass: number }) => {
      const rs = await client?.utils.getUserTradingFeeRate(assetClass)
      const fundingFeeInfo = rs?.data ?? { takerFeeRate: '0', makerFeeRate: '0' }
      const tradingFee = parseBigNumber(size)
        .mul(parseBigNumber(price))
        .mul(
          parseBigNumber(
            ethers.formatUnits(fundingFeeInfo?.takerFeeRate ?? 0, TRADING_FEE_DECIMALS) ?? 0,
          ),
        )

      return tradingFee.toString()
    },
    [client],
  )
  return {
    getTradingFee,
  }
}
