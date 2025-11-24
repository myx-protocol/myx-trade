import { FinanceItem } from '@/components/Record/Items/Finance'

export const FinanceList = () => {
  return (
    <>
      {new Array(10).fill(0).map((_, index) => (
        <FinanceItem key={index} />
      ))}
    </>
  )
}
