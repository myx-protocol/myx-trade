import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import useGlobalStore from '@/store/globalStore'
import { usePositionStore } from '@/store/position/createStore'
import useSWR from 'swr'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'

export const useGetOrderList = (filter = false) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { symbolInfo } = useGlobalStore()
  const { isWrongNetwork } = useWalletConnection()
  const { hideOthersSymbols, selectChainId } = usePositionStore()
  const { address } = useWalletConnection()

  const { data, mutate } = useSWR(
    client && clientIsAuthenticated && !isWrongNetwork
      ? {
          key: 'get_orders',
          poolId: symbolInfo?.poolId,
          hideOthersSymbols,
          selectChainId,
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

      const ordersWithChainId = filteredOrders.filter(
        (item: any) => selectChainId === '0' || `${item.chainId}` === selectChainId,
      )
      return ordersWithChainId ?? []
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
