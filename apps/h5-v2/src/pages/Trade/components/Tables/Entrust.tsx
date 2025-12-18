import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'
import useGlobalStore from '@/store/globalStore'

export const Entrusts = () => {
  const orders = useGetOrderList(true)
  const { poolList } = useGlobalStore()

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
