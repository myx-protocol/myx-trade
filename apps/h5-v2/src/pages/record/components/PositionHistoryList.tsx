import { PositionHistoryItem } from '@/components/Record/Items/PositionHistoryItem'

export const PositionHistoryList = () => {
  return (
    <>
      {new Array(10).fill(0).map((_, index) => (
        <PositionHistoryItem key={index} />
      ))}
    </>
  )
}
