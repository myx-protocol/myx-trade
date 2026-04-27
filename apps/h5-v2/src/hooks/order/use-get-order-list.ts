import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import useGlobalStore from '@/store/globalStore'
import { usePositionStore } from '@/store/position/createStore'
import useSWR from 'swr'
import { useWalletConnection } from '../wallet/useWalletConnection'
import { useCallback, useEffect } from 'react'
import { tradePubSub } from '@/utils/pubsub'
import { OrderStatus } from '@myx-trade/sdk'
import { toast } from '@/components/UI/Toast'
import { useGetActivePoolList } from '@/components/Trade/hooks/use-get-pool-list'
import { getOrderToastParts } from '@/utils/order/get-order-toast-parts'
import { renderOrderToastContent } from '@/utils/order/action-toast'
import { t } from '@lingui/core/macro'

const OrderStatusMap: Record<string, () => string> = {
  'EXPIRED ORDER': () => t`无效订单，被Keeper清理`,
  'USER CANCELLED': () => t`用户已取消`,
  'Position closed': () => t`仓位已平仓`,
  'No execute size': () => t`无可执行数量`,
  'Slippage exceeded': () => t`滑点超限`,
  'Not position owner': () => t`非仓位持有者`,
  'Order expired': () => t`订单执行超时失效`,
  'Order size out of range': () => t`订单数量超限`,
  'Invalid Order': () => t`无效订单`,
}

export const useGetOrderList = (filter = false) => {
  const { client, clientIsAuthenticated } = useMyxSdkClient()
  const { symbolInfo } = useGlobalStore()
  const { isWrongNetwork, address } = useWalletConnection()
  const { hideOthersSymbols, selectChainId } = usePositionStore()
  const { poolList } = useGetActivePoolList()

  const { data, mutate } = useSWR(
    client && clientIsAuthenticated && !isWrongNetwork && address
      ? {
          key: 'get_orders',
          address,
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

  const handleRefresh = useCallback(() => {
    mutate()
  }, [mutate])

  const handleOrderSubscription = useCallback(
    (data: Record<string, any>) => {
      const orderInfo = (data?.data ?? {}) as Record<string, any>
      const pool = poolList.find((item: any) => item.poolId === orderInfo.poolId)
      console.log('ws: orderInfo-->', orderInfo)

      if (orderInfo.status === OrderStatus.CANCELLED) {
        const reason = orderInfo.reason as string | undefined

        if (reason === 'Position closed') {
          toast.success({ title: OrderStatusMap['Position closed']() })
          mutate()
          return
        }

        if (reason !== 'USER CANCELLED') {
          const reasonText =
            reason && typeof OrderStatusMap[reason] === 'function'
              ? OrderStatusMap[reason]()
              : (reason ?? '')
          toast.error({ title: t`Transaction failed`, content: reasonText || undefined })
        }
        mutate()
        return
      }

      const parts = getOrderToastParts(orderInfo, pool)
      if (parts) {
        toast.success({
          title: parts.title,
          content: renderOrderToastContent(parts),
        })
      }

      mutate()
    },
    [mutate, poolList],
  )

  useEffect(() => {
    tradePubSub.on('place:order:success', handleRefresh)
    return () => {
      tradePubSub.off('place:order:success', handleRefresh)
    }
  }, [handleRefresh])

  useEffect(() => {
    client?.subscription.connect()
    if (client && clientIsAuthenticated) {
      client?.subscription.subscribeOrder(handleOrderSubscription)
    }

    return () => {
      client?.subscription.unsubscribeOrder(handleOrderSubscription)
    }
  }, [client, clientIsAuthenticated, handleOrderSubscription])

  return data ?? []
}
