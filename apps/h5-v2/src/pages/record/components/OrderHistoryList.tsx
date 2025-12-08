import { Empty } from '@/components/Empty'
import { OrderHistoryItem } from '@/components/Record/Items/OrderHistory'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'

export const OrderHistoryList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { isWalletConnected, address } = useWalletConnection()
  const { data: orderHistory, isLoading } = useQuery({
    queryKey: ['orderHistory', address],
    enabled: Boolean(isWalletConnected && address && !!client && clientIsAuthenticated),
    queryFn: async () => {
      if (!client || !isWalletConnected) return null
      const res = await client.order.getOrderHistory({
        chainId: 0,
        poolId: undefined,
      })
      return res.data
    },
  })

  if (!isLoading && !orderHistory?.length) {
    return <Empty />
  }

  return (
    <>
      {orderHistory?.map((item) => (
        <OrderHistoryItem key={item.orderId} item={item} />
      ))}
    </>
  )
}
