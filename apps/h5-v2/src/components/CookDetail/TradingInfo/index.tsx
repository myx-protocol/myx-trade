import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Collapse } from '@/components/Trade/components/Collapse'
import { Trans } from '@lingui/react/macro'
import { usePoolContext } from '@/pages/Cook/hook'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { formatNumber } from '@/utils/number.ts'

export const TradingInfo = () => {
  const { baseLpDetail } = usePoolContext()
  return (
    <Collapse title={<Trans>Perp Trading Info</Trans>} defaultOpen={true}>
      <div className="flex flex-col gap-[16px] text-[12px] font-normal text-white">
        <FlexRowLayout
          left={
            <p className="text-[#848E9C]">
              <Trans>24h Volume</Trans>
            </p>
          }
          right={<p>{baseLpDetail?.volume ? formatNumber(Number(baseLpDetail?.volume)) : '--'}</p>}
        />
        <FlexRowLayout
          left={<p className="text-[#848E9C]">Long Positions</p>}
          right={
            <p>
              ${formatNumberPrecision(baseLpDetail?.longPosition, COMMON_PRICE_DISPLAY_DECIMALS)}
            </p>
          }
        />
        <FlexRowLayout
          left={<p className="text-[#848E9C]">Short Positions</p>}
          right={
            <p>
              ${formatNumberPrecision(baseLpDetail?.shortPosition, COMMON_PRICE_DISPLAY_DECIMALS)}
            </p>
          }
        />
        <FlexRowLayout
          left={<p className="text-[#848E9C]">Funding Rate</p>}
          right={<p>{formatNumberPercent(baseLpDetail?.fundingRate)}</p>}
        />
      </div>
    </Collapse>
  )
}
