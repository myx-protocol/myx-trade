import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Tooltips } from '@/components/UI/Tooltips'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { LongShortBar } from '@/components/Trade/components/LongShortBar'
import { t } from '@lingui/core/macro'
import { usePoolLiquidityInfo } from './usePoolLiquidityInfo'
import useGlobalStore from '@/store/globalStore'

export const PoolContent = () => {
  const { symbolInfo } = useGlobalStore()
  const { data: poolLiquidityInfo } = usePoolLiquidityInfo()
  return (
    <div className="px-[16px] py-[24px]">
      <p className="text-[14px] font-medium text-[#CED1D9]">
        <Trans>Pools info</Trans>
      </p>
      <div className="mt-[20px] flex flex-col gap-[16px] text-[12px] font-medium text-white">
        <FlexRowLayout
          left={
            <Tooltips title={t`当前市场最大可开做多仓位`}>
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
            <Tooltips title={t`当前市场最大可开做空仓位`}>
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
            <Tooltips title={t`本合约市场上所有多头头寸的总和，反映了市场上投资者的看涨信心`}>
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
            <Tooltips title={t`本合约市场上所有空头头寸的总和，反映了市场上投资者的看跌信心。`}>
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
            <p className="font-normal text-[#9397A3]">
              <Trans>Long-Short Ratio</Trans>
            </p>
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
    </div>
  )
}
