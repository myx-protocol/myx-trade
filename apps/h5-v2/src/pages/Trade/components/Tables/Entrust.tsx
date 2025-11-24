import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'

export const Entrusts = () => {
  const orders = useGetOrderList()
  const { isWrongNetwork } = useWalletConnection()
  return (
    <>
      {new Array(10).fill(0).map((_, index) => (
        <OpenOrderItem key={index} />
      ))}
    </>
  )
}
