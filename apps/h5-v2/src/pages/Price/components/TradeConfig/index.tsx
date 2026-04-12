import { FlexRowLayout } from '@/components/FlexRowLayout'
import { Tooltips } from '@/components/UI/Tooltips'
import { decimalToPercent, formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { usePriceStore } from '../../store'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { useMemo } from 'react'
import Big from 'big.js'
import { Divider } from '@mui/material'

const formatTimeDiff = (seconds: number) => {
  if (seconds < 60)
    return {
      value: seconds,
      unit: t`Seconds`,
    }
  if (seconds < 3600)
    return {
      value: Math.floor(seconds / 60),
      unit: t`Minutes`,
    }
  return {
    value: Math.floor(seconds / 3600),
    unit: t`Hours`,
  }
}

export const TradeConfig = () => {
  const { symbolInfo } = usePriceStore()
  const leverage = useLeverage(symbolInfo?.poolId)

  const initMarginRate = useMemo(() => {
    return Big(1).div(leverage)
  }, [leverage])
  const { poolConfig } = useGetPoolConfig(symbolInfo?.poolId, symbolInfo?.chainId)
  return (
    <div className="px-[16px] pt-[16px] pb-[54px] leading-none">
      <div className="pt-[8px]">
        <p className="text-regular text-[14px] font-medium text-white">
          Trading Parameters & Risk Controls
        </p>
        <div className="text-secondary mt-[12px] text-[12px]">
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Minimum size allowed per opening order, displayed in quote currency for U-margined markets.`}
              >
                <p className="text-tooltip">
                  <Trans>Min Open Size</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {formatNumber(poolConfig?.levelConfig?.minOrderSizeInUsd || 0)}
                <span className="ml-[2px]">{symbolInfo?.quoteSymbol || ''}</span>
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips title={t`Maximum leverage allowed in this market.`}>
                <p className="text-tooltip">
                  <Trans>Max Leverage</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {formatNumber(poolConfig?.levelConfig?.leverage || 0)}
                <span className="ml-[2px]">x</span>
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips title={t`Minimum margin ratio required to open a position.`}>
                <p className="text-tooltip">
                  <Trans>Initial Margin Rate</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(initMarginRate || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Minimum margin ratio required to keep a position open; falling below it may trigger liquidation.`}
              >
                <p className="text-tooltip">
                  <Trans>Maintenance Margin Rate</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.maintainCollateralRate || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Trading within this capacity has limited or negligible price impact.`}
              >
                <p className="text-tooltip">
                  <Trans>No-Slippage Capacity</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {formatNumber(poolConfig?.levelConfig?.lockLiquidity || 0, {
                  showUnit: false,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Time window during which no-slippage protection is applied, displayed in hours.`}
              >
                <p className="text-tooltip">
                  <Trans>No-Slippage Time Window</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {formatTimeDiff(poolConfig?.levelConfig?.lockSeconds || 0).value}
                <span className="ml-[2px]">
                  {formatTimeDiff(poolConfig?.levelConfig?.lockSeconds || 0).unit || t`Seconds`}
                </span>
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips title={t`Allowed price movement range under no-slippage protection.`}>
                <p className="text-tooltip">
                  <Trans>Price Protection Range</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.lockPriceRate || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Maximum allowed deviation between execution price and oracle price.`}
              >
                <p className="text-tooltip">
                  <Trans>Slippage Protection Threshold</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.maxPriceDeviation || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Risk control parameter used to limit exposure under abnormal profit or extreme market conditions.`}
              >
                <p className="text-tooltip">
                  <Trans>Profit Risk Control</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.profitWindowSize || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Used to calculate slippage impact within the liquidity lock range.`}
              >
                <p className="text-tooltip">
                  <Trans>Base Parameter S</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.slip || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
        </div>
      </div>
      <Divider
        sx={{
          margin: '20px 0',
          background: '#202129',
        }}
      />
      <div>
        <p className="text-regular text-[14px] font-medium text-white">Funding Rates & LP</p>
        <div className="text-secondary mt-[12px] text-[12px]">
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Time interval for funding rate settlement and updates, displayed in seconds.`}
              >
                <p className="text-tooltip">
                  <Trans>Funding Settlement Interval</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {formatTimeDiff(poolConfig?.levelConfig?.fundingFeeSeconds || 0).value}
                <span className="ml-[2px]">
                  {formatTimeDiff(poolConfig?.levelConfig?.fundingFeeSeconds || 0).unit ||
                    t`Seconds`}
                </span>
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips
                title={t`Core parameter in the funding model used to adjust funding level.`}
              >
                <p className="text-tooltip">
                  <Trans>Funding Parameter R2</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.fundingFeeRate2 || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips title={t`First-stage growth parameter in the funding model.`}>
                <p className="text-tooltip">
                  <Trans>Funding Growth G1</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.fundingGrowthG1 || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips title={t`Second-stage growth parameter in the funding model.`}>
                <p className="text-tooltip">
                  <Trans>Funding Growth G2</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.fundingGrowthG2 || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
          <FlexRowLayout
            className="py-[8px]"
            left={
              <Tooltips title={t`Share of rewards allocated to genesis LPs.`}>
                <p className="text-tooltip">
                  <Trans>Genesis LP Share</Trans>
                </p>
              </Tooltips>
            }
            right={
              <p className="text-white">
                {decimalToPercent(poolConfig?.levelConfig?.genesisFeeRate || 0, {
                  decimals: 2,
                })}
              </p>
            }
          />
        </div>
      </div>
    </div>
  )
}
