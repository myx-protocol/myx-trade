import { Trans } from '@lingui/react/macro'

interface PriceInfoProps {
  currentPrice?: string
  forceTpPrice?: string
  entryPrice?: string
  estimatedForceSlPrice?: string
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
          <span className="text-[#CED1D9]">{currentPrice}</span>
        </div>
      )}

      {entryPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>开仓价格</Trans>
          </span>
          <span className="text-[#CED1D9]">{entryPrice}</span>
        </div>
      )}

      {forceTpPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>强制止盈价</Trans>
          </span>
          <span className="text-[#CED1D9]">{forceTpPrice}</span>
        </div>
      )}
      {estimatedForceSlPrice && (
        <div className="flex items-center justify-between text-[12px] leading-[1] font-medium text-[#848E9C]">
          <span>
            <Trans>预估强平价</Trans>
          </span>
          <span className="text-[#F29D39]">{estimatedForceSlPrice}</span>
        </div>
      )}
    </div>
  )
}
