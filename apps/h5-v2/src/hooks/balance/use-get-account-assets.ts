import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import useSWR from 'swr'
import { type ChainId } from '@myx-trade/sdk'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { parseBigNumber } from '@/utils/bn'
import { useGetOrderList } from '../order/use-get-order-list'

type AccountAssets = {
  availableMargin: string
  freeMargin: string
  walletBalance: string
  freeBaseAmount: string
  baseProfit: string
  quoteProfit: string
  releaseTime: number
  usedMargin: string
}

export const useGetAccountAssets = (chainId?: number, poolId?: string) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient(chainId)
  const orderList = useGetOrderList(true)
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
          orderList,
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
        const usedMargin = orderList.reduce((acc: Big, order: any) => {
          return acc.plus(parseBigNumber(order.collateralAmount))
        }, parseBigNumber(0))
        let lockedMargin = parseBigNumber(0)
        const quoteProfit = parseBigNumber(
          ethers.formatUnits(assets.quoteProfit, pool?.quoteDecimals ?? 6).toString(),
        )
        const walletBalance = parseBigNumber(
          ethers.formatUnits(assets.walletBalance, pool?.quoteDecimals ?? 6).toString(),
        )
        let freeMargin = parseBigNumber(
          ethers.formatUnits(assets.freeMargin, pool?.quoteDecimals ?? 6).toString(),
        )
        let diff = parseBigNumber(0)

        if (usedMargin.gte(quoteProfit)) {
          diff = usedMargin.minus(quoteProfit)
          freeMargin = freeMargin.minus(diff)
          lockedMargin = parseBigNumber(0)
        } else {
          diff = quoteProfit.minus(usedMargin)
          lockedMargin = diff
        }

        const availableMargin = lockedMargin.plus(walletBalance).plus(freeMargin).toString()

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
          quoteProfit: lockedMargin.toString(),
          releaseTime: Number(assets.releaseTime),
          usedMargin: usedMargin.toString(),
        }
      } else {
        return {
          availableMargin: '0',
          freeMargin: '0',
          walletBalance: '0',
          freeBaseAmount: '0',
          baseProfit: '0',
          quoteProfit: '0',
          releaseTime: 0,
          usedMargin: '0',
        }
      }
    },
    {
      refreshInterval: 1000,
    },
  )
  return (
    data ?? {
      availableMargin: '0',
      freeMargin: '0',
      walletBalance: '0',
      freeBaseAmount: '0',
      baseProfit: '0',
      quoteProfit: '0',
      releaseTime: 0,
      usedMargin: '0',
    }
  )
}
