import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'

interface PriceInfoProps {
  currentPrice?: number
  forceTpPrice?: number
  entryPrice?: number
  estimatedForceSlPrice?: number
}

export const PriceInfo = ({
  currentPrice,
  forceTpPrice,
  entryPrice,
  estimatedForceSlPrice,
}: PriceInfoProps) => {
  return (
    <div className="mt-[16px] flex flex-col gap-[10px]">
      {currentPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>当前价格</Trans>
          </span>
          <span className="text-[#CED1D9]">
            {formatNumber(currentPrice || 0, {
              showUnit: false,
              showSign: false,
            })}
          </span>
        </div>
      )}

      {entryPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>开仓价格</Trans>
          </span>
          <span className="text-[#CED1D9]">
            {formatNumber(entryPrice || 0, {
              showUnit: false,
              showSign: false,
            })}
          </span>
        </div>
      )}

      {forceTpPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>强制止盈价</Trans>
          </span>
          <span className="text-[#CED1D9]">
            {formatNumber(forceTpPrice || 0, {
              showUnit: false,
              showSign: false,
            })}
          </span>
        </div>
      )}
      {estimatedForceSlPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>预估强平价</Trans>
          </span>
          <span className="text-[#F29D39]">
            {formatNumber(estimatedForceSlPrice || 0, {
              showUnit: false,
              showSign: false,
            })}
          </span>
        </div>
      )}
    </div>
  )
}
