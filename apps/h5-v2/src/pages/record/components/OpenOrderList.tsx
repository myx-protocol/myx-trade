import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import useGlobalStore from '@/store/globalStore'

export const OpenOrderList = () => {
  const orderList = useGetOrderList()
  const { poolList } = useGlobalStore()
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
