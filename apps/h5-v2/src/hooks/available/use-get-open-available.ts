import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { useTradePageStore, type PoolConfig } from '@/components/Trade/store/TradePageStore'
import { usePoolLiquidityInfo } from '@/components/Trade/TradePanel/PoolsInfo/usePoolLiquidityInfo'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import { parseBigNumber } from '@/utils/bn'
import { useGetAccountAssets } from '../balance/use-get-account-assets'
import { useGetLiquidityInfo } from './use-get-liquidity-info'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { ethers } from 'ethers'
import { useMemo, useRef } from 'react'
import { displayAmount } from '@/utils/number'
import { useGetUserTradingFeeRate } from '../calculate/use-get-trading-fee'

// 自定义 hook：保留之前的有效值（在渲染时同步更新，不使用 useEffect）
function useStableValue<T>(value: T, isValid: (val: T) => boolean): T {
  const ref = useRef<T>(value)

  // 在渲染时立即判断和更新，不等到 useEffect
  if (isValid(value)) {
    ref.current = value
  }

  return ref.current
}

export const useGetOpenAvailable = () => {
  const { symbolInfo, poolConfig } = useTradePageStore()
  const { data: poolLiquidityInfo } = usePoolLiquidityInfo()
  const leverage = useLeverage(symbolInfo?.poolId)
  const { autoMarginMode, collateralAmount, price } = useTradePanelStore()
  const fundingFeeRate = useGetUserTradingFeeRate(
    symbolInfo?.chainId ?? 0,
    poolConfig?.levelConfig?.assetClass ?? 0,
    poolConfig as PoolConfig,
  )
  const { liquidityInfo } = useGetLiquidityInfo()
  const safePrice = useMemo(() => {
    return !price || parseBigNumber(price ?? '1').eq(0) ? '1' : price
  }, [price])

  const slipValue = useMemo(() => {
    if (!poolConfig) return 1
    return Number(poolConfig?.levelConfig?.slip ?? 1)
  }, [poolConfig])

  const {
    maxOpenLongByConfigRatio: longByConfigRatio,
    maxOpenShortByConfigRatio: shortByConfigRatio,
  } = useMemo(() => {
    const openSlippage =
      getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.OPEN,
      }) ?? 1

    const ratio = openSlippage / slipValue
    const maxOpenByConfigRatio = Math.log(ratio)
    const configTotalRatio = parseBigNumber(1).plus(maxOpenByConfigRatio)

    // 确保 windowCaps 和 openInterest 是字符串，避免每次都重新计算
    const windowCapsStr = liquidityInfo?.windowCaps ?? '0'
    const openInterestStr = liquidityInfo?.openInterest ?? '0'

    const windowCaps = parseBigNumber(
      ethers.formatUnits(windowCapsStr, symbolInfo?.quoteDecimals).toString(),
    )
    const openInterest = parseBigNumber(
      ethers.formatUnits(openInterestStr, symbolInfo?.baseDecimals).toString(),
    )

    // 计算并固定精度，避免浮点数精度问题
    const longRatio = windowCaps.mul(configTotalRatio).minus(openInterest)
    const shortRatio = windowCaps.mul(configTotalRatio).plus(openInterest)

    return {
      maxOpenLongByConfigRatio: longRatio.toFixed(18),
      maxOpenShortByConfigRatio: shortRatio.toFixed(18),
    }
  }, [
    liquidityInfo?.windowCaps,
    liquidityInfo?.openInterest,
    slipValue,
    symbolInfo?.chainId,
    symbolInfo?.poolId,
    symbolInfo?.quoteDecimals,
    symbolInfo?.baseDecimals,
  ])

  // 使用 useStableValue 保留有效值，避免计算结果变成 0 或负数
  const maxOpenLongByConfigRatio = useStableValue(longByConfigRatio, (val) => {
    const numVal = parseFloat(val)
    return !isNaN(numVal) && numVal > 0
  })
  const maxOpenShortByConfigRatio = useStableValue(shortByConfigRatio, (val) => {
    const numVal = parseFloat(val)
    return !isNaN(numVal) && numVal > 0
  })

  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)

  const collateralAmountValue = useMemo(() => {
    const availableMarginOriginal = accountAssets?.availableMargin?.toString()
    const ratio = parseBigNumber(leverage).mul(parseBigNumber(fundingFeeRate))
    const ratioRs = parseBigNumber(1).minus(ratio)
    const availableMargin = parseBigNumber(availableMarginOriginal).mul(ratioRs).toString()

    const value = autoMarginMode
      ? parseBigNumber(availableMargin ?? '0').mul(parseBigNumber(leverage))
      : parseBigNumber(collateralAmount).mul(parseBigNumber(leverage))
    return value.toString()
  }, [autoMarginMode, accountAssets?.availableMargin, leverage, collateralAmount, fundingFeeRate])

  // 使用 useStableValue 保留有效值，避免 refetch 期间的空值
  const stableBuySizeValue = useStableValue(
    poolLiquidityInfo?.buySizeValueFormatedQuote,
    (val) => val !== undefined && val !== null && val !== '0',
  )
  const stableSellSizeValue = useStableValue(
    poolLiquidityInfo?.sellSizeValueFormatedQuote,
    (val) => val !== undefined && val !== null && val !== '0',
  )

  const maxOpenLongQuoteAmountByLiquidityString = useMemo(() => {
    return stableBuySizeValue ?? '0'
  }, [stableBuySizeValue])

  const maxOpenShortQuoteAmountByLiquidityString = useMemo(() => {
    return stableSellSizeValue ?? '0'
  }, [stableSellSizeValue])

  return useMemo(() => {
    const collateralValue = parseBigNumber(collateralAmountValue)
    let longQuoteAmount = collateralAmountValue
    let longBaseAmount = collateralValue.div(parseBigNumber(safePrice)).toString()

    if (collateralValue.gte(parseBigNumber(maxOpenLongQuoteAmountByLiquidityString))) {
      if (
        parseBigNumber(maxOpenLongQuoteAmountByLiquidityString).gte(
          parseBigNumber(maxOpenLongByConfigRatio),
        )
      ) {
        longQuoteAmount = maxOpenLongByConfigRatio
        longBaseAmount = parseBigNumber(maxOpenLongByConfigRatio)
          .div(parseBigNumber(safePrice))
          .toString()
      } else {
        longQuoteAmount = parseBigNumber(maxOpenLongQuoteAmountByLiquidityString).toString()
        longBaseAmount = parseBigNumber(maxOpenLongQuoteAmountByLiquidityString)
          .div(parseBigNumber(safePrice))
          .toString()
      }
    }

    let shortQuoteAmount = collateralAmountValue
    let shortBaseAmount = collateralValue.div(parseBigNumber(safePrice)).toString()

    if (collateralValue.gte(parseBigNumber(maxOpenShortQuoteAmountByLiquidityString))) {
      if (
        parseBigNumber(maxOpenShortQuoteAmountByLiquidityString).gte(
          parseBigNumber(maxOpenShortByConfigRatio),
        )
      ) {
        shortQuoteAmount = maxOpenShortByConfigRatio
        shortBaseAmount = parseBigNumber(maxOpenShortByConfigRatio)
          .div(parseBigNumber(safePrice))
          .toString()
      } else {
        shortQuoteAmount = parseBigNumber(maxOpenShortQuoteAmountByLiquidityString).toString()
        shortBaseAmount = parseBigNumber(maxOpenShortQuoteAmountByLiquidityString)
          .div(parseBigNumber(safePrice))
          .toString()
      }
    }

    return {
      maxOpenLong: {
        quoteAmount: longQuoteAmount ?? '0',
        baseAmount: longBaseAmount ?? '0',
      },
      maxOpenShort: {
        quoteAmount: shortQuoteAmount ?? '0',
        baseAmount: shortBaseAmount ?? '0',
      },
      // 格式化后的显示值
      maxOpenLongDisplayQuote: displayAmount(longQuoteAmount ?? '0'),
      maxOpenLongDisplayBase: displayAmount(longBaseAmount ?? '0'),
      maxOpenShortDisplayQuote: displayAmount(shortQuoteAmount ?? '0'),
      maxOpenShortDisplayBase: displayAmount(shortBaseAmount ?? '0'),
    }
  }, [
    collateralAmountValue,
    safePrice,
    maxOpenLongQuoteAmountByLiquidityString,
    maxOpenShortQuoteAmountByLiquidityString,
    maxOpenLongByConfigRatio,
    maxOpenShortByConfigRatio,
  ])
}
