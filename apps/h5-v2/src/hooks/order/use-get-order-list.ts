import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { usePositionStore } from '@/store/position/createStore'
import useSWR from 'swr'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'

export const useGetOrderList = (filter = false) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { symbolInfo } = useTradePageStore()
  const { isWrongNetwork } = useWalletConnection()
  const { hideOthersSymbols } = usePositionStore()
  const { address } = useWalletConnection()

  const { data, mutate } = useSWR(
    client && clientIsAuthenticated && !isWrongNetwork
      ? {
          key: 'get_orders',
          poolId: symbolInfo?.poolId,
          hideOthersSymbols,
          clientIsAuthenticated,
          isWrongNetwork,
          filter,
        }
      : null,
    async () => {
      const rs: any = await client?.order.getOrders(address as string)

      const orders = rs.data ?? []

      if (!filter) {
        return orders
      }

      const filteredOrders = orders.filter((item: any) =>
        hideOthersSymbols ? item.poolId === symbolInfo?.poolId : true,
      )

      return filteredOrders
    },
    {
      refreshInterval: 5000,
    },
  )

  useEffect(() => {
    const onRefresh = () => {
      mutate()
    }
    tradePubSub.on('place:order:success', onRefresh)
    return () => {
      tradePubSub.off('place:order:success', onRefresh)
    }
  }, [])

  return data ?? []
}
