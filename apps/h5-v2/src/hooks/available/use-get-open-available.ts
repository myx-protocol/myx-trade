import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import type { PoolConfig } from '@/store/globalStore'
import { usePoolLiquidityInfo } from '@/components/Trade/TradePanel/PoolsInfo/usePoolLiquidityInfo'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import { parseBigNumber } from '@/utils/bn'
import { useGetAccountAssets } from '../balance/use-get-account-assets'
import { useGetLiquidityInfo } from './use-get-liquidity-info'
import { useMemo, useRef } from 'react'
import { displayAmount } from '@/utils/number'
import { useGetUserTradingFeeRate } from '../calculate/use-get-trading-fee'
import useGlobalStore from '@/store/globalStore'
import { useGetPositionList } from '../position/use-get-position-list'
import { Direction, OrderType } from '@myx-trade/sdk'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import useSWR from 'swr'
import { useGetNetworkFee } from '../calculate/use-get-liq-price'
import { WINDOW_CAPS_DECIMALS } from '@/constant/decimals'
import { getSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { ethers } from 'ethers'

export const useGetOpenAvailable = () => {
  const { symbolInfo, poolConfig, shareCollateral } = useGlobalStore()
  const { data: poolLiquidityInfo } = usePoolLiquidityInfo()
  const leverage = useLeverage(symbolInfo?.poolId)
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[symbolInfo?.poolId as string]?.price.toString() ?? '0'
  const { autoMarginMode, collateralAmount, price, orderType } = useTradePanelStore()
  const fundingFeeRate = useGetUserTradingFeeRate(
    symbolInfo?.chainId ?? 0,
    poolConfig?.levelConfig?.assetClass ?? 0,
    poolConfig as PoolConfig,
  )
  const { liquidityInfo } = useGetLiquidityInfo()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)
  const { getNetworkFee } = useGetNetworkFee({
    poolId: symbolInfo?.poolId as string,
    chainId: symbolInfo?.chainId ?? 0,
  })
  const { data: networkFee } = useSWR(
    {
      key: 'getNetworkFee',
      poolId: symbolInfo?.poolId as string,
      chainId: symbolInfo?.chainId ?? 0,
    },
    async () => await getNetworkFee(),
  )

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

  const positionList = useGetPositionList(true)

  const longPosition = positionList?.find(
    (position: any) =>
      position.direction === Direction.LONG && position.poolId === symbolInfo?.poolId,
  )
  const shortPosition = positionList?.find(
    (position: any) =>
      position.direction === Direction.SHORT && position.poolId === symbolInfo?.poolId,
  )

  let longPositionAvailableMargin = '0'
  let shortPositionAvailableMargin = '0'

  if (longPosition) {
    const pnl =
      parseBigNumber(marketPrice)
        .minus(parseBigNumber(longPosition.entryPrice))
        .mul(parseBigNumber(longPosition.size)) ?? '0'

    const poolMaxLeverage = poolConfig?.levelConfig?.leverage ?? 1
    const positionLeverage = parseBigNumber(longPosition.userLeverage ?? '1').gt(0)
      ? longPosition.userLeverage
      : 1

    const safeLeverage = parseBigNumber(positionLeverage).gt(poolMaxLeverage)
      ? poolMaxLeverage
      : positionLeverage

    //可减少金额 = 仓位保证金 - 持仓数量 * 入场价 / 杠杆 + 资金费 - 交易手续费 + 盈亏
    const originMargin = parseBigNumber(longPosition.entryPrice)
      .mul(parseBigNumber(longPosition.size))
      .div(safeLeverage)

    longPositionAvailableMargin = parseBigNumber(longPosition.freeAmount)
      .minus(originMargin)
      .plus(parseBigNumber(longPosition ?? '0'))
      .minus(parseBigNumber(longPosition ?? '0'))
      .plus(pnl)
      .toString()
  }

  if (shortPosition) {
    const pnl =
      parseBigNumber(shortPosition.entryPrice)
        .minus(parseBigNumber(marketPrice))
        .mul(parseBigNumber(shortPosition.size)) ?? '0'

    const poolMaxLeverage = poolConfig?.levelConfig?.leverage ?? 1
    const positionLeverage = parseBigNumber(shortPosition.userLeverage ?? '1').gt(0)
      ? shortPosition.userLeverage
      : 1
    const safeLeverage = parseBigNumber(positionLeverage).gt(poolMaxLeverage)
      ? poolMaxLeverage
      : positionLeverage

    //可减少金额 = 仓位保证金 - 持仓数量 * 入场价 / 杠杆 + 资金费 - 交易手续费 + 盈亏
    const originMargin = parseBigNumber(shortPosition.entryPrice)
      .mul(parseBigNumber(shortPosition.size))
      .div(safeLeverage)

    shortPositionAvailableMargin = parseBigNumber(shortPosition.freeAmount)
      .minus(originMargin)
      .plus(parseBigNumber(shortPosition ?? '0'))
      .minus(parseBigNumber(shortPosition ?? '0'))
      .plus(pnl)
      .toString()
  }

  // 合并所有计算逻辑到一个 useMemo 中，减少中间状态
  return useMemo(() => {
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
      shareCollateral ? parseBigNumber(longPositionAvailableMargin) : 0,
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

    const feeRatio = parseBigNumber(leverage).mul(parseBigNumber(fundingFeeRate))
    const adjustedRatio = parseBigNumber(1).minus(feeRatio)

    longQuoteAmount = parseBigNumber(longQuoteAmount).mul(adjustedRatio).toString()

    const longBaseAmount = parseBigNumber(longQuoteAmount).div(parseBigNumber(safePrice)).toString()

    // 6. 计算 Short 的最大可开仓量
    // 需要取三个值的最小值：用户保证金、滑点配置限额、池子流动性限额
    const shortLimit1 = collateralValue.plus(
      shareCollateral ? parseBigNumber(shortPositionAvailableMargin) : 0,
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
    poolConfig?.levelConfig?.slip,
    // 流动性数据（使用缓存的稳定值）
    stableLiquidityInfo?.windowCaps,
    stableLiquidityInfo?.openInterest,
    stablePoolLiquidityInfo?.buySizeValueFormatedQuote,
    stablePoolLiquidityInfo?.sellSizeValueFormatedQuote,
    // 用户数据（使用缓存的稳定值）
    autoMarginMode,
    collateralAmount,
    leverage,
    fundingFeeRate,
    stableAccountAssets?.availableMargin,
    longPositionAvailableMargin,
    shortPositionAvailableMargin,
    shareCollateral,
    networkFee,
  ])
}
