import { MarketListRow } from '@/components/MarketList/MarketListRow'
import { Skeleton } from '@/components/UI/Skeleton'

interface LoadingProps {
  total: number
}

export const Loading = ({ total }: LoadingProps) => {
  return (
    <div className="pb-[10px]">
      {Array.from({ length: total }).map((_, index) => (
        <MarketListRow
          key={index}
          className="h-[58px] px-[16px] py-[8px] text-[12px] leading-[1.2] text-[#6D7180]"
          values={[
            <Skeleton height={30} width={126} />,
            <Skeleton height={30} width={64} />,
            <Skeleton height={30} width={76} />,
          ]}
        />
      ))}
    </div>
  )
}
