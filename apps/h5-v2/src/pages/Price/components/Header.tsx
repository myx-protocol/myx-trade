import { SortDown, ArrowLeftLong, Star } from '@/components/Icon'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { truncateString } from '@/utils/string'

export const Header = () => {
  return (
    <div className="bg-deep sticky top-0 z-20 flex h-auto shrink-0 items-center justify-between px-[16px] pt-[16px] pb-[12px]">
      <div className="flex items-center gap-[12px] text-white">
        <span role="button" className="flex">
          <ArrowLeftLong size={20} />
        </span>

        <div className="flex items-center gap-[4px]" role="button">
          <p className="text-[16px] font-bold">BTCUSDT</p>
          <span>
            <SortDown size={8} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[10px]">
        <span role="button" className="flex">
          <Star size={18} />
        </span>
        <div className="flex items-center">
          <CoinIcon size={20} icon={''} />
          <div className="ml-[4px] flex items-center gap-[2px]" role="button">
            <p className="text-[14px] font-medium">
              {truncateString('0x0000000000000000000000000000000000000000', 2, 4, '..')}
            </p>
            <span>
              <SortDown size={8} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
