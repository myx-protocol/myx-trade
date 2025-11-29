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
  price?: number | string
  change?: number | string
  balance?: number | string
  liq?: number | string
  mca?: number | string
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
          console.log(item)
          const address = item.asset.contracts.filter(
            (_address: string) =>
              _address.toLowerCase() !== '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
          )?.[0]
          const asset = item.contracts_balances.find(
            (s: { address: string }) => s.address === address,
          )
          const token = {
            chainId: Number(asset.chainId.replace('evm:', '')),
            address,
            decimals: asset.decimals,
            logo: item.asset.logo,
            name: item.asset.name,
            symbol: item.asset.symbol,
            price: item.price,
            change: item.price_change_24h * 100,
            balance: asset.balance.toString(),
          } as Asset
          console.log(token)
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
