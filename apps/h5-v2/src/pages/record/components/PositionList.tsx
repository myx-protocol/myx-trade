import { PositionItem } from '@/components/Record/Items/Position'

export const PositionList = () => {
  return (
    <>
      {new Array(10).fill(0).map((_, index) => (
        <PositionItem key={index} />
      ))}
    </>
  )
}
