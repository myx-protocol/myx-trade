import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import useGlobalStore from '@/store/globalStore'
import { Empty } from '@/components/Empty'

export const OpenOrderList = () => {
  const orderList = useGetOrderList()
  const { poolList } = useGlobalStore()
  if (!orderList.length) {
    return (
      <div>
        <Empty />
      </div>
    )
  }
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
