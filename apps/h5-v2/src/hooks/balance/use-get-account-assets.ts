import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import useSWR from 'swr'
import { type ChainId } from '@myx-trade/sdk'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { parseBigNumber } from '@/utils/bn'

type AccountAssets = {
  totalAvailableMargin: string
  availableMargin: string
  freeMargin: string
  walletBalance: string
  freeBaseAmount: string
  baseProfit: string
  quoteProfit: string
  releaseTime: number
}

export const useGetAccountAssets = (chainId?: number, poolId?: string) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient(chainId)
  const { address } = useWalletConnection()
  const { poolList } = useGetPoolList()
  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === poolId)
  }, [poolList, poolId])

  const { data } = useSWR(
    address && poolId && client && clientIsAuthenticated && chainId
      ? {
          key: 'getAccountAssets',
          chainId: chainId,
          address,
          poolId: poolId as string,
          clientIsAuthenticated,
          client,
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
        const totalAvailableMargin = parseBigNumber(assets.availableMargin.toString() ?? '0')
          .plus(parseBigNumber(assets.walletBalance.toString() ?? '0'))
          .toString()

        return {
          totalAvailableMargin: ethers
            .formatUnits(totalAvailableMargin, pool?.quoteDecimals ?? 6)
            .toString(),
          availableMargin: ethers
            .formatUnits(assets.availableMargin, pool?.quoteDecimals ?? 6)
            .toString(),
          freeMargin: ethers.formatUnits(assets.freeMargin, pool?.quoteDecimals ?? 6).toString(),
          walletBalance: ethers
            .formatUnits(assets.walletBalance, pool?.quoteDecimals ?? 6)
            .toString(),
          freeBaseAmount: ethers
            .formatUnits(assets.freeBaseAmount, pool?.baseDecimals ?? 6)
            .toString(),
          baseProfit: ethers.formatUnits(assets.baseProfit, pool?.baseDecimals ?? 6).toString(),
          quoteProfit: ethers.formatUnits(assets.quoteProfit, pool?.quoteDecimals ?? 6).toString(),
          releaseTime: Number(assets.releaseTime),
        }
      } else {
        return {
          totalAvailableMargin: '0',
          availableMargin: '0',
          freeMargin: '0',
          walletBalance: '0',
          freeBaseAmount: '0',
          baseProfit: '0',
          quoteProfit: '0',
          releaseTime: 0,
        }
      }
    },
    {
      refreshInterval: 1000,
    },
  )
  return (
    data ?? {
      totalAvailableMargin: '0',
      availableMargin: '0',
      freeMargin: '0',
      walletBalance: '0',
      freeBaseAmount: '0',
      baseProfit: '0',
      quoteProfit: '0',
      releaseTime: 0,
    }
  )
}
