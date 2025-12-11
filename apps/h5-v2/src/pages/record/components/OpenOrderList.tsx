import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'

export const OpenOrderList = () => {
  const orderList = useGetOrderList()
  const { poolList } = useGetPoolList()
  return (
    <>
      {orderList.map((order: any, index: number) => (
        <OpenOrderItem
          key={index}
          order={order}
          pool={poolList.find((pool: any) => pool.poolId === order.poolId)}
        />
      ))}
    </>
  )
}
