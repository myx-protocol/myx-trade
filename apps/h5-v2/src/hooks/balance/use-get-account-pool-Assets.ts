import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { useQuery } from '@tanstack/react-query'
export const useGetAccountPoolAssets = (poolId: string) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { isConnected, address } = useWalletConnection()
  const { data } = useQuery({
    queryKey: ['get_account_pool_assets', address],
    enabled: Boolean(isConnected && address && client && poolId && clientIsAuthenticated),
    refetchInterval: 20000,
    queryFn: async () => {
      const rs: any = await await client?.account.getTradableAmount({
        poolId: poolId as string,
      })

      const assets = rs.data
      return assets
    },
  })
  return (
    data ?? {
      profitIsReleased: '0',
      freeAmount: '0',
      tradeableProfit: '0',
    }
  )
}
