import { OrderHistoryItem } from '@/components/Record/Items/OrderHistory'

export const OrderHistoryList = () => {
  return (
    <>
      {new Array(10).fill(0).map((_, index) => (
        <OrderHistoryItem key={index} />
      ))}
    </>
  )
}
