import { useCallback } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { parseBigNumber } from '@/utils/bn'
import { TRADING_FEE_DECIMALS } from '@/constant/decimals'
import { ethers } from 'ethers'
import useSWR from 'swr'
import useGlobalStore from '@/store/globalStore'
import type { PoolConfig } from '@/store/globalStore'

export const useGetTradingFee = (chainId?: number) => {
  const { client } = useMyxSdkClient(chainId)
  const { poolConfig } = useGlobalStore()

  const getTradingFee = useCallback(
    async ({ size, price, assetClass }: { size: string; price: string; assetClass: number }) => {
      const rs = await client?.utils.getUserTradingFeeRate(
        assetClass,
        poolConfig?.level ?? 1,
        chainId ?? 0,
      )
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
    [client, poolConfig],
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
  const { poolConfig } = useGlobalStore()

  const { data: fundingFeeInfo } = useSWR(
    ['getFundingFeeInfo', assetClass, poolConfig?.level ?? 1],
    async () => {
      const rs = await client?.utils.getUserTradingFeeRate(
        assetClass,
        poolConfig?.level ?? 1,
        chainId ?? 0,
      )
      return rs?.data ?? { takerFeeRate: '0', makerFeeRate: '0' }
    },
  )

  const tradingFee = parseBigNumber(size)
    .mul(parseBigNumber(price))
    .mul(
      parseBigNumber(
        ethers.formatUnits(fundingFeeInfo?.takerFeeRate ?? 0, TRADING_FEE_DECIMALS) ?? 0,
      ),
    )

  return tradingFee.toString()
}

export const useGetUserTradingFeeRate = (
  chainId: number,
  assetClass: number,
  poolConfig: PoolConfig,
) => {
  const { client } = useMyxSdkClient(chainId)
  const { data: fundingFeeRate } = useSWR(
    ['getFundingFeeRate', assetClass, poolConfig?.level ?? 1],
    async () => {
      const rs = await client?.utils.getUserTradingFeeRate(
        assetClass,
        poolConfig?.level ?? 1,
        chainId ?? 0,
      )
      return rs?.data ?? { takerFeeRate: '0', makerFeeRate: '0' }
    },
    {
      refreshInterval: 1000,
    },
  )

  return ethers.formatUnits(fundingFeeRate?.takerFeeRate ?? 0, TRADING_FEE_DECIMALS) ?? '0'
}
