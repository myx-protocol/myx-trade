import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { useQuery } from '@tanstack/react-query'
export const useGetWalletBalance = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { isConnected, address } = useWalletConnection()
  const { data } = useQuery({
    queryKey: ['get_wallet_balance', address],
    enabled: Boolean(isConnected && address && client && clientIsAuthenticated),
    refetchInterval: 10000,
    queryFn: async () => {
      const rs: any = await client?.account.getWalletQuoteTokenBalance()
      return rs?.data ?? '0'
    },
  })

  return data ?? '0'
}
