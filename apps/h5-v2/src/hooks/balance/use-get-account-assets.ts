import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import useSWR from 'swr'
import { MarketPoolState, type ChainId } from '@myx-trade/sdk'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { parseBigNumber } from '@/utils/bn'
import useGlobalStore from '@/store/globalStore'

type AccountAssets = {
  availableMargin: string
  freeMargin: string
  walletBalance: string
  freeBaseAmount: string
  baseProfit: string
  quoteProfit: string
  releaseTime: number
  usedMargin: string
  reservedAmount: string
}

const DEFAULT_ACCOUNT_ASSETS = {
  availableMargin: '0',
  freeMargin: '0',
  walletBalance: '0',
  freeBaseAmount: '0',
  baseProfit: '0',
  quoteProfit: '0',
  releaseTime: 0,
  usedMargin: '0',
}

export const useGetAccountAssets = (chainId?: number, poolId?: string) => {
  const { client } = useMyxSdkClient(chainId)

  const { address } = useWalletConnection()
  const { poolList } = useGlobalStore()
  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === poolId)
  }, [poolList, poolId])
  const isPreBench = pool?.state === MarketPoolState.PreBench

  const { data } = useSWR(
    address && poolId && client && chainId && !isPreBench
      ? {
          key: 'getAccountAssets',
          chainId: chainId,
          address,
          poolId: poolId as string,
        }
      : null,
    async () => {
      const rs: any = await client?.account.getAccountInfo(
        chainId as ChainId,
        address as string,
        poolId as string,
      )
      const assets = rs.data as AccountAssets
      if (rs.code === 0) {
        const quoteProfit = parseBigNumber(
          ethers.formatUnits(assets.quoteProfit, pool?.quoteDecimals ?? 6).toString(),
        )
        const walletBalance = parseBigNumber(
          ethers.formatUnits(assets.walletBalance, pool?.quoteDecimals ?? 6).toString(),
        )
        const freeMargin = parseBigNumber(
          ethers.formatUnits(assets.freeMargin, pool?.quoteDecimals ?? 6).toString(),
        )

        const reservedAmount = parseBigNumber(
          ethers.formatUnits(assets.reservedAmount, pool?.quoteDecimals ?? 6).toString(),
        )

        const availableMargin = walletBalance.plus(freeMargin).toString()

        return {
          availableMargin: availableMargin.toString(),
          freeMargin: freeMargin.toString(),
          walletBalance: ethers
            .formatUnits(assets.walletBalance, pool?.quoteDecimals ?? 6)
            .toString(),
          freeBaseAmount: ethers
            .formatUnits(assets.freeBaseAmount, pool?.baseDecimals ?? 6)
            .toString(),
          baseProfit: ethers.formatUnits(assets.baseProfit, pool?.baseDecimals ?? 6).toString(),
          quoteProfit: quoteProfit.toString(),
          releaseTime: Number(assets.releaseTime),
          usedMargin: reservedAmount,
        }
      } else {
        return DEFAULT_ACCOUNT_ASSETS
      }
    },
    {
      refreshInterval: 1000,
    },
  )

  return data ?? DEFAULT_ACCOUNT_ASSETS
}
