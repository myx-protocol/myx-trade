import { OpenOrderItem } from '@/components/Record/Items/OpenOrders'

export const FinanceList = () => {
  return (
    <>
      {new Array(10).fill(0).map((_, index) => (
        <OpenOrderItem key={index} />
      ))}
    </>
  )
}
