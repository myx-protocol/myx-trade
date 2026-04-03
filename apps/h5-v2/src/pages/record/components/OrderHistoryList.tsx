import { Empty } from '@/components/Empty'
import { OrderHistoryItem } from '@/components/Record/Items/OrderHistory'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { usePositionStore } from '@/store/position/createStore'
import { useQuery } from '@tanstack/react-query'

export const OrderHistoryList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { isWalletConnected, address } = useWalletConnection()
  const { selectChainId } = usePositionStore()
  const { data: orderHistory, isLoading } = useQuery({
    queryKey: ['orderHistory', address, selectChainId],
    enabled: Boolean(isWalletConnected && address && !!client && clientIsAuthenticated),
    queryFn: async () => {
      if (!client || !isWalletConnected) return null
      const res = await client.order.getOrderHistory(
        {
          chainId: selectChainId === '0' ? 0 : parseInt(selectChainId),
          poolId: undefined,
        },
        address ?? '',
      )
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
