import { FinanceItem } from '@/components/Record/Items/Finance'
import { Empty } from '@/components/Empty'
import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
export const FinanceList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const { data: financeData, isLoading } = useQuery({
    queryKey: ['financeList', address],
    enabled: Boolean(address && !!client && clientIsAuthenticated),
    queryFn: async () => {
      if (!client || !clientIsAuthenticated) return null
      const res = await client.account.getTradeFlow({
        chainId: 0,
        poolId: undefined,
      })
      return res.data
    },
  })

  if (!isLoading && !financeData?.length) {
    return <Empty />
  }

  return (
    <>
      {financeData?.map((item, index) => (
        <FinanceItem key={index} item={item} />
      ))}
    </>
  )
}
