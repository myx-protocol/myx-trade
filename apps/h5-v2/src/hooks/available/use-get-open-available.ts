import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import type { PoolConfig } from '@/store/globalStore'
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
import useGlobalStore from '@/store/globalStore'
import { WINDOW_CAPS_DECIMALS } from '@/constant/decimals'
import useSWR from 'swr'
import { useGetNetworkFee } from '../calculate/use-get-liq-price'
import { Direction, OrderType } from '@myx-trade/sdk'
import { useGetPositionList } from '../position/use-get-position-list'
import { useGetPositionAvailableMargin } from './use-get-position-available-margin'

export const useGetOpenAvailable = () => {
  const { symbolInfo, poolConfig } = useGlobalStore()
  const { data: poolLiquidityInfo } = usePoolLiquidityInfo()
  const { shareCollateral } = useGlobalStore()
  const { getNetworkFee } = useGetNetworkFee({
    poolId: symbolInfo?.poolId as string,
    chainId: symbolInfo?.chainId ?? 0,
  })

  const leverage = useLeverage(symbolInfo?.poolId)
  const { autoMarginMode, collateralAmount, price, orderType } = useTradePanelStore()
  const tradingFeeRate = useGetUserTradingFeeRate(
    symbolInfo?.chainId ?? 0,
    poolConfig?.levelConfig?.assetClass ?? 0,
    poolConfig as PoolConfig,
  )

  const { data: networkFee } = useSWR(
    {
      key: 'getNetworkFee',
      poolId: symbolInfo?.poolId as string,
      chainId: symbolInfo?.chainId ?? 0,
    },
    async () => await getNetworkFee(),
  )

  const { liquidityInfo } = useGetLiquidityInfo()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)
  const positionList = useGetPositionList(true)

  const longPosition = positionList?.find(
    (position: any) =>
      position.direction === Direction.LONG && position.poolId === symbolInfo?.poolId,
  )
  const shortPosition = positionList?.find(
    (position: any) =>
      position.direction === Direction.SHORT && position.poolId === symbolInfo?.poolId,
  )

  const { longPositionAvailableMargin, shortPositionAvailableMargin } =
    useGetPositionAvailableMargin(symbolInfo?.poolId as string, symbolInfo?.chainId ?? 0)

  // 缓存所有异步数据源，避免 refetch 期间的闪烁
  // 只有当新数据有效且非零时才更新缓存
  const poolLiquidityInfoRef = useRef(poolLiquidityInfo)
  if (
    poolLiquidityInfo?.buySizeValueFormatedQuote &&
    poolLiquidityInfo?.sellSizeValueFormatedQuote &&
    poolLiquidityInfo?.buySizeValueFormatedQuote !== '0' &&
    poolLiquidityInfo?.sellSizeValueFormatedQuote !== '0'
  ) {
    poolLiquidityInfoRef.current = poolLiquidityInfo
  }
  const stablePoolLiquidityInfo = poolLiquidityInfoRef.current

  const liquidityInfoRef = useRef(liquidityInfo)
  if (
    liquidityInfo?.windowCaps &&
    liquidityInfo?.openInterest &&
    liquidityInfo?.windowCaps !== '0'
  ) {
    liquidityInfoRef.current = liquidityInfo
  }
  const stableLiquidityInfo = liquidityInfoRef.current

  const accountAssetsRef = useRef(accountAssets)
  if (accountAssets?.availableMargin !== undefined && accountAssets?.availableMargin !== null) {
    accountAssetsRef.current = accountAssets
  }
  const stableAccountAssets = accountAssetsRef.current

  // 合并所有计算逻辑到一个 useMemo 中，减少中间状态
  return useMemo(() => {
    // 1. 计算基础参数
    const safePrice = !price || parseBigNumber(price ?? '1').eq(0) ? '1' : price
    const slipValue = Number(poolConfig?.levelConfig?.slip ?? 1)
    const openSlippage =
      getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.OPEN,
      }) ?? 1

    // 2. 计算可用保证金总值（使用缓存的稳定值）
    const availableMargin = stableAccountAssets?.availableMargin?.toString() ?? '0'

    const collateralAmountValue = autoMarginMode
      ? parseBigNumber(availableMargin).mul(parseBigNumber(leverage)).toString()
      : parseBigNumber(collateralAmount).mul(parseBigNumber(leverage)).toString()

    // 3. 计算滑点配置限额（maxOpenByConfigRatio）（使用缓存的稳定值）
    const ratio = openSlippage / (slipValue ?? 1)
    const maxOpenByConfigRatio = ratio > 0 ? Math.log(ratio) : 0
    const configTotalRatio = parseBigNumber(1).plus(maxOpenByConfigRatio)

    const windowCapsStr = stableLiquidityInfo?.windowCaps ?? '0'
    const openInterestStr = stableLiquidityInfo?.openInterest ?? '0'

    const windowCaps = parseBigNumber(
      ethers.formatUnits(windowCapsStr, WINDOW_CAPS_DECIMALS).toString(),
    )
    const openInterest = parseBigNumber(
      ethers.formatUnits(openInterestStr, symbolInfo?.baseDecimals ?? 18).toString(),
    )

    const maxOpenLongByConfigRatio = windowCaps.mul(configTotalRatio).minus(openInterest).toString()
    const maxOpenShortByConfigRatio = windowCaps.mul(configTotalRatio).plus(openInterest).toString()

    // 4. 获取池子流动性限额（使用缓存的值）
    const maxOpenLongQuoteAmountByLiquidity =
      stablePoolLiquidityInfo?.buySizeValueFormatedQuote ?? '0'
    const maxOpenShortQuoteAmountByLiquidity =
      stablePoolLiquidityInfo?.sellSizeValueFormatedQuote ?? '0'

    // 5. 计算 Long 的最大可开仓量
    // 需要取三个值的最小值：用户保证金、滑点配置限额、池子流动性限额
    const collateralValue = parseBigNumber(collateralAmountValue)

    // 计算三者最小值
    const longLimit1 = collateralValue.plus(
      shareCollateral
        ? parseBigNumber(longPositionAvailableMargin).mul(parseBigNumber(leverage))
        : 0,
    ) // 用户可用保证金
    const longLimit2 = parseBigNumber(maxOpenLongByConfigRatio) // 滑点配置限额
    const longLimit3 = parseBigNumber(maxOpenLongQuoteAmountByLiquidity) // 池子流动性限额

    // 取最小值
    let longQuoteAmount = longLimit1.toString()
    if (longLimit2.lt(longLimit1) && orderType === OrderType.MARKET) {
      longQuoteAmount = longLimit2.toString()
    }
    if (longLimit3.lt(parseBigNumber(longQuoteAmount))) {
      longQuoteAmount = longLimit3.toString()
    }

    if (longPosition) {
      longQuoteAmount = parseBigNumber(longQuoteAmount)
        .minus(parseBigNumber(networkFee ?? 0).mul(3))
        .toString()
    }

    const feeRatio = parseBigNumber(leverage).mul(parseBigNumber(tradingFeeRate))
    const adjustedRatio = parseBigNumber(1).minus(feeRatio)

    longQuoteAmount = parseBigNumber(longQuoteAmount).mul(adjustedRatio).toString()

    const longBaseAmount = parseBigNumber(longQuoteAmount).div(parseBigNumber(safePrice)).toString()

    // 6. 计算 Short 的最大可开仓量
    // 需要取三个值的最小值：用户保证金、滑点配置限额、池子流动性限额
    const shortLimit1 = collateralValue.plus(
      shareCollateral
        ? parseBigNumber(shortPositionAvailableMargin).mul(parseBigNumber(leverage))
        : 0,
    ) // 用户可用保证金
    const shortLimit2 = parseBigNumber(maxOpenShortByConfigRatio) // 滑点配置限额
    const shortLimit3 = parseBigNumber(maxOpenShortQuoteAmountByLiquidity) // 池子流动性限额

    // 取最小值
    let shortQuoteAmount = shortLimit1.toString()
    if (shortLimit2.lt(shortLimit1) && orderType === OrderType.MARKET) {
      shortQuoteAmount = shortLimit2.toString()
    }
    if (shortLimit3.lt(parseBigNumber(shortQuoteAmount))) {
      shortQuoteAmount = shortLimit3.toString()
    }

    shortQuoteAmount = parseBigNumber(shortQuoteAmount).mul(adjustedRatio).toString()
    if (shortPosition) {
      shortQuoteAmount = parseBigNumber(shortQuoteAmount)
        .minus(parseBigNumber(networkFee ?? 0).mul(3))
        .toString()
    }

    const shortBaseAmount = parseBigNumber(shortQuoteAmount)
      .div(parseBigNumber(safePrice))
      .toString()

    // 7. 返回结果
    return {
      maxOpenLong: {
        quoteAmount: longQuoteAmount,
        baseAmount: longBaseAmount,
      },
      maxOpenShort: {
        quoteAmount: shortQuoteAmount,
        baseAmount: shortBaseAmount,
      },
      maxOpenLongDisplayQuote: displayAmount(longQuoteAmount),
      maxOpenLongDisplayBase: displayAmount(longBaseAmount),
      maxOpenShortDisplayQuote: displayAmount(shortQuoteAmount),
      maxOpenShortDisplayBase: displayAmount(shortBaseAmount),
    }
  }, [
    // 基础参数
    price,
    symbolInfo?.chainId,
    symbolInfo?.poolId,
    symbolInfo?.quoteDecimals,
    symbolInfo?.baseDecimals,
    // poolConfig?.levelConfig?.slip,
    // 流动性数据（使用缓存的稳定值）
    stableLiquidityInfo?.windowCaps,
    stableLiquidityInfo?.openInterest,
    stablePoolLiquidityInfo?.buySizeValueFormatedQuote,
    stablePoolLiquidityInfo?.sellSizeValueFormatedQuote,
    // 用户数据（使用缓存的稳定值）
    autoMarginMode,
    collateralAmount,
    leverage,
    tradingFeeRate,
    stableAccountAssets?.availableMargin,
    longPositionAvailableMargin,
    shortPositionAvailableMargin,
    shareCollateral,
    networkFee,
  ])
}
