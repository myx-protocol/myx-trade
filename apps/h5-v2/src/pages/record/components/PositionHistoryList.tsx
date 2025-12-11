import { PositionHistoryItem } from '@/components/Record/Items/PositionHistoryItem'
import { useQuery } from '@tanstack/react-query'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { Empty } from '@/components/Empty'

export const PositionHistoryList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { address } = useWalletConnection()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['positionHistoryList', address],
    enabled: Boolean(address && !!client && clientIsAuthenticated),
    queryFn: async () => {
      if (!client || !clientIsAuthenticated) return null
      const res = await client.position.getPositionHistory(
        {
          chainId: 0,
          poolId: undefined,
        },
        address ?? '',
      )
      return res.data
    },
  })

  if (!isLoading && !data?.length) {
    return <Empty />
  }

  return (
    <>
      {data?.map((item, index) => (
        <PositionHistoryItem key={index} item={item} />
      ))}
    </>
  )
}
