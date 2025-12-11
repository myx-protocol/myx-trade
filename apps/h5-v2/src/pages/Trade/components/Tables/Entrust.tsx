import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'
import { useGetPoolList } from '@/components/Trade/hooks/use-get-pool-list'

export const Entrusts = () => {
  const orders = useGetOrderList()
  const { poolList } = useGetPoolList()

  return (
    <>
      {orders.map((item: any, index: number) => (
        <OpenOrderItem
          key={index}
          order={item}
          pool={poolList.find((pool: any) => pool.poolId === item.poolId)}
        />
      ))}
    </>
  )
}
