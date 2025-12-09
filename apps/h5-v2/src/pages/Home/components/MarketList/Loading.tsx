import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Skeleton } from '@/components/UI/Skeleton'

export const MarketListLoading = () => {
  return (
    <div>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
        <MarketListRow
          className="my-[14px]"
          key={item}
          values={[
            <Skeleton width={120} height={24} />,
            <Skeleton height={24} width={64} />,
            <Skeleton width={76} height={24} />,
          ]}
        />
      ))}
    </div>
  )
}
