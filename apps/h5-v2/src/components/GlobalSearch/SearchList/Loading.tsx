import { Skeleton } from '@/components/UI/Skeleton'

interface SearchListLoadingProps {
  line?: number
}

export const SearchListLoading = ({ line = 8 }: SearchListLoadingProps) => {
  return (
    <div>
      {Array.from({ length: line }).map((_, index) => (
        <div
          key={index}
          className="flex justify-between gap-[64.67px] px-[12px] py-[12px] text-[12px] leading-[1] font-normal text-[#6D7180]"
        >
          <div className="flex h-[30px] w-[210px] items-center">
            <Skeleton width={165} height={30} />
          </div>
          <Skeleton width={105} height={30} />
          <Skeleton width={103} height={30} />
        </div>
      ))}
    </div>
  )
}
