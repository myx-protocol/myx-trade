import { Price } from '@/components/Price'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'

export const PriceInfo = () => {
  return (
    <div className="mb-[12px] flex items-center justify-between px-[16px]">
      <div>
        <Price className="text-[28px] font-bold" value={100123} />
        <p className="text-[12px] leading-[1.5] font-medium text-[#CED1D9]">
          {/* rate value */}
          <span>
            $
            {formatNumber(100123, {
              showUnit: true,
            })}
          </span>
          <RiseFallTextPrecent className="ml-[10px]" value={0.0518} />
        </p>
      </div>

      <div>
        <p className="text-[11px] text-[#6D7180]">
          <Trans>Funding / Countdown</Trans>
        </p>
        <p className="mt-[6px] text-[13px] font-medium text-[#CED1D9]">
          <span>0.0518%</span>
          <span className="px-[2px]">/</span>
          <span>07:02:01</span>
        </p>
      </div>
    </div>
  )
}
