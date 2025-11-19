import { Tooltips } from '@/components/UI/Tooltips'
import { usePoolContext } from '@/pages/Cook/hook'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'

export const LatestPrice = () => {
  const { price, baseLpDetail } = usePoolContext()

  return (
    <div className="ml-[48px] leading-[1]">
      {/* price */}
      <p className="text-[16px] font-bold">
        <Tooltips title="Market Price">
          <span className="border-b-[1px] border-dashed border-b-[#848E9C] text-white select-none">
            ${formatNumberPrecision(price, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Tooltips>
      </p>
      {/* change */}
      <p className="mt-[2px] mt-[4px] text-[12px] font-medium text-white">
        <RiseFallTextPrecent value={Number(baseLpDetail?.lpPriceChange)} />
      </p>
    </div>
  )
}
