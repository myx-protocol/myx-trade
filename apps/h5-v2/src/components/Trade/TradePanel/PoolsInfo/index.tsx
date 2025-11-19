import { Trans } from '@lingui/react/macro'
import { Collapse } from '../../components/Collapse'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Tooltips } from '@/components/UI/Tooltips'
import { LongShortBar } from '../../components/LongShortBar'
import { useTradePageStore } from '../../store/TradePageStore'
import { usePoolLiquidityInfo } from './usePoolLiquidityInfo'
import { formatNumber } from '@/utils/number'

export const PoolsInfo = () => {
  const { symbolInfo } = useTradePageStore()

  const { data: poolLiquidityInfo } = usePoolLiquidityInfo()
  return (
    <Collapse title={<Trans>Pools Info</Trans>} defaultOpen={true}>
      <div className="flex flex-col gap-[14px] text-[12px] font-medium text-white">
        <FlexRowLayout
          left={
            <Tooltips title="W=Available Long">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Available Long</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {formatNumber(poolLiquidityInfo?.buySizeValueFormatedQuote || 0, {
                showUnit: false,
              })}
              <span className="ml-[2px]">{symbolInfo?.quoteSymbol || ''}</span>
            </p>
          }
        />

        <FlexRowLayout
          left={
            <Tooltips title="Available Short">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Available Short</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {formatNumber(poolLiquidityInfo?.sellSizeValueFormatedQuote || 0, {
                showUnit: false,
              })}
              <span className="ml-[2px]">{symbolInfo?.quoteSymbol || ''}</span>
            </p>
          }
        />
        <FlexRowLayout
          left={
            <Tooltips title="Open Interest (Long)">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Open Interest (Long)</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {formatNumber(poolLiquidityInfo?.longSizeValueFormatedQuote || 0, {
                showUnit: false,
              })}
              <span className="ml-[2px]">{symbolInfo?.quoteSymbol || ''}</span>
            </p>
          }
        />
        <FlexRowLayout
          left={
            <Tooltips title="Open Interest (Short)">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Open Interest (Short)</Trans>
              </p>
            </Tooltips>
          }
          right={
            <p>
              {formatNumber(poolLiquidityInfo?.shortSizeValueFormatedQuote || 0, {
                showUnit: false,
              })}
              <span className="ml-[2px]">{symbolInfo?.quoteSymbol || ''}</span>
            </p>
          }
        />

        <FlexRowLayout
          left={
            <Tooltips title="Open Interest (Short)">
              <p className="text-tooltip font-normal text-[#9397A3]">
                <Trans>Long-Short Ratio</Trans>
              </p>
            </Tooltips>
          }
          right={
            <div className="w-[95px]">
              <LongShortBar
                long={Number(poolLiquidityInfo?.longSize || 0)}
                short={Number(poolLiquidityInfo?.shortSize || 0)}
              />
            </div>
          }
        />
      </div>
    </Collapse>
  )
}
