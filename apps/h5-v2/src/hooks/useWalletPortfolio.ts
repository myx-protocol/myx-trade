import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useQuery } from '@tanstack/react-query'
import { getAccountHoldings } from '@/request'
import { type ChainId, getSupportedChainIdsByEnv } from '@/config/chain.ts'
import { useState } from 'react'

export interface Asset {
  chainId: number
  address: string
  decimals: number
  logo: string
  name: string
  symbol: string
  price: number | string
  change: number | string
  balance: number | string
}
export const useWalletPortfolio = () => {
  const { address: account } = useWalletConnection()
  const [chainId, setChainId] = useState<ChainId | undefined>(undefined)
  const { data: walletAssets, isLoading } = useQuery({
    queryKey: [{ key: 'getWalletAssets' }, chainId, account],
    enabled: !!account,
    queryFn: async () => {
      if (!account) return undefined
      try {
        const result = await getAccountHoldings(
          account,
          !chainId
            ? ((getSupportedChainIdsByEnv() as unknown as ChainId[]) ?? undefined)
            : [chainId],
        )
        return (result?.data?.assets || []).map((item: any) => {
          const token = {
            chainId: Number(item.asset?.blockchains?.[0].replace('evm:', '')),
            address: item.asset.contracts[0],
            decimals: item.asset.decimals[0],
            logo: item.asset.logo,
            name: item.asset.name,
            symbol: item.asset.symbol,
            price: item.price,
            change: item.price_change_24h,
            balance: item.token_balance,
          } as Asset
          return token
        })
      } catch (error) {
        return [] as Asset[]
      }
    },
  })

  return {
    walletAssets,
    isLoading,
    chainId,
    setChainId,
  }
}
