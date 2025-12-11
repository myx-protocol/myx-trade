import { Trans } from '@lingui/react/macro'
import type React from 'react'

interface PriceInfoProps {
  currentPrice?: string
  entryPrice?: string
}

export const PriceInfo = ({ currentPrice, entryPrice }: PriceInfoProps) => {
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
    </div>
  )
}
