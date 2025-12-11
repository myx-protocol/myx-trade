import { useCallback } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { parseBigNumber } from '@/utils/bn'
import { TRADING_FEE_DECIMALS } from '@/constant/decimals'
import { ethers } from 'ethers'
import useSWR from 'swr'

export const useGetTradingFee = (chainId?: number) => {
  const { client } = useMyxSdkClient(chainId)

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

export const useGetTradingFeeInfo = ({
  size,
  price,
  assetClass,
  chainId,
}: {
  size: string
  price: string
  assetClass: number
  chainId?: number
}) => {
  const { client } = useMyxSdkClient(chainId)

  const { data: fundingFeeInfo } = useSWR('getFundingFeeInfo', async () => {
    const rs = await client?.utils.getUserTradingFeeRate(assetClass)
    return rs?.data ?? { takerFeeRate: '0', makerFeeRate: '0' }
  })

  const tradingFee = parseBigNumber(size)
    .mul(parseBigNumber(price))
    .mul(
      parseBigNumber(
        ethers.formatUnits(fundingFeeInfo?.takerFeeRate ?? 0, TRADING_FEE_DECIMALS) ?? 0,
      ),
    )

  return tradingFee.toString()
}
