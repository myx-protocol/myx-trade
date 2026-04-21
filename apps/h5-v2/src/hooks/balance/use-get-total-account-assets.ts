import { useAllMyxSdkClients } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import useSWR from 'swr'
import { MarketPoolState, type ChainId } from '@myx-trade/sdk'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { parseBigNumber } from '@/utils/bn'
import useGlobalStore from '@/store/globalStore'

export const useGetTotalAccountAssets = () => {
  const { clients, clientIsAuthenticated } = useAllMyxSdkClients()
  const { address } = useWalletConnection()
  const { poolList } = useGlobalStore()

  // 相同 quoteToken 地址只取一个池子（避免重复计算钱包余额），且只取 Listed 状态的
  const targetPools = useMemo(() => {
    const seen = new Set<string>()
    return (poolList as any[]).filter((p) => {
      if (p.state !== MarketPoolState.Listed) return false
      if (seen.has(p.quoteToken)) return false
      seen.add(p.quoteToken)
      return true
    })
  }, [poolList])

  // 所有涉及链都已鉴权才发请求
  const allAuthenticated = useMemo(() => {
    const chainIds = [...new Set<number>(targetPools.map((p) => p.chainId))]
    return chainIds.length > 0 && chainIds.every((id) => Boolean(clientIsAuthenticated?.[id]))
  }, [targetPools, clientIsAuthenticated])

  // SWR key 只用稳定字符串，不带对象引用
  const poolKey = useMemo(
    () => targetPools.map((p) => `${p.chainId}:${p.poolId}`).join(','),
    [targetPools],
  )

  const { data } = useSWR(
    address && allAuthenticated && poolKey
      ? { key: 'getTotalAccountAssets', address, poolKey }
      : null,
    async () => {
      const results = await Promise.allSettled(
        targetPools.map((pool) => {
          const client = clients[pool.chainId as number]
          if (!client) return Promise.resolve(null)
          return client.account.getAccountInfo(
            pool.chainId as ChainId,
            address as string,
            pool.poolId as string,
          )
        }),
      )

      let total = parseBigNumber('0')
      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        const pool = targetPools[i]
        if (result.status !== 'fulfilled' || !result.value || result.value.code !== 0) continue
        const assets = result.value.data
        const decimals = pool.quoteDecimals ?? 6
        const walletBalance = parseBigNumber(
          ethers.formatUnits(assets.walletBalance, decimals).toString(),
        )
        const freeMargin = parseBigNumber(
          ethers.formatUnits(assets.freeMargin, decimals).toString(),
        )
        total = total.plus(walletBalance).plus(freeMargin)
      }
      return total.toString()
    },
    { refreshInterval: 5000 },
  )

  return data ?? '0'
}
