import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { usePositionStore } from '@/store/position/createStore'
import useSWR from 'swr'

export const useGetOrderList = () => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { symbolInfo } = useTradePageStore()

  const { hideOthersSymbols } = usePositionStore()

  const { data } = useSWR(
    client && clientIsAuthenticated
      ? { key: 'get_orders', poolId: symbolInfo?.poolId, hideOthersSymbols, clientIsAuthenticated }
      : null,
    async () => {
      const rs: any = await client?.order.getOrders()

      const orders = rs.data ?? []

      const filteredOrders = orders.filter((item: any) =>
        hideOthersSymbols ? item.poolId === symbolInfo?.poolId : true,
      )

      return filteredOrders
    },
    {
      refreshInterval: 5000,
    },
  )

  return data ?? []
}
