import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { usePoolLiquidityInfo } from '@/components/Trade/TradePanel/PoolsInfo/usePoolLiquidityInfo'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import { useGetWalletBalance } from '../balance/use-get-wallet-balance'
import { useMemo } from 'react'
import { ethers } from 'ethers'
import { parseBigNumber } from '@/utils/bn'
import { useTotalAvailableBalance } from '../balance/use-total-available-balance'
import { useGetAccountPoolAssets } from '../balance/use-get-account-pool-Assets'

export const useGetOpenAvailable = () => {
  const { data: poolLiquidityInfo } = usePoolLiquidityInfo()
  const { symbol, symbolInfo } = useTradePageStore()
  const leverage = useLeverage(symbol)
  const { autoMarginMode, collateralAmount, price } = useTradePanelStore()
  const walletBalance = useTotalAvailableBalance()
  const accountPoolAssets = useGetAccountPoolAssets(symbolInfo?.poolId as string)

  const maxOpenLongAmount = useMemo(() => {
    if (parseBigNumber(price).eq(0)) {
      return {
        quoteAmount: '0',
        baseAmount: '0',
      }
    }

    const freeAmountAmount = accountPoolAssets.freeAmount ?? '0'
    const tradeableProfitAmount = accountPoolAssets.tradeableProfit ?? '0'
    const walletBalanceAmount = parseBigNumber(walletBalance)
      .plus(parseBigNumber(freeAmountAmount))
      .plus(parseBigNumber(tradeableProfitAmount))
      .toString()
    const walletBalanceString = ethers.formatUnits(
      walletBalanceAmount.toString(),
      symbolInfo?.quoteDecimals ?? 6,
    )

    const collateralAmountValue = autoMarginMode
      ? parseBigNumber(walletBalanceString).mul(parseBigNumber(leverage))
      : parseBigNumber(collateralAmount).mul(parseBigNumber(leverage))
    const maxOpenLongQuoteAmountByLiquidityString = poolLiquidityInfo?.buySizeValue
      ? ethers
          .formatUnits(poolLiquidityInfo.buySizeValue, symbolInfo?.quoteDecimals ?? 6)
          .toString()
      : '0'

    if (collateralAmountValue.gte(parseBigNumber(maxOpenLongQuoteAmountByLiquidityString))) {
      return {
        quoteAmount: parseBigNumber(maxOpenLongQuoteAmountByLiquidityString).toString(),
        baseAmount: parseBigNumber(maxOpenLongQuoteAmountByLiquidityString)
          .div(parseBigNumber(price))
          .toString(),
      }
    }

    return {
      quoteAmount: collateralAmountValue.toString(),
      baseAmount: collateralAmountValue.div(parseBigNumber(price)).toString(),
    }
  }, [
    poolLiquidityInfo,
    leverage,
    autoMarginMode,
    collateralAmount,
    walletBalance,
    symbolInfo,
    price,
    autoMarginMode,
    walletBalance,
  ])

  const maxOpenShortAmount = useMemo(() => {
    if (parseBigNumber(price).eq(0)) {
      return {
        quoteAmount: '0',
        baseAmount: '0',
      }
    }
    const walletBalanceString = ethers.formatUnits(walletBalance, symbolInfo?.quoteDecimals ?? 6)
    const collateralAmountValue = autoMarginMode
      ? parseBigNumber(walletBalanceString).mul(parseBigNumber(leverage))
      : parseBigNumber(collateralAmount).mul(parseBigNumber(leverage))
    const maxOpenLongQuoteAmountByLiquidityString = poolLiquidityInfo?.shortSize
      ? ethers.formatUnits(poolLiquidityInfo.shortSize, symbolInfo?.quoteDecimals ?? 6).toString()
      : '0'
    if (collateralAmountValue.gte(parseBigNumber(maxOpenLongQuoteAmountByLiquidityString))) {
      return {
        quoteAmount: parseBigNumber(maxOpenLongQuoteAmountByLiquidityString).toString(),
        baseAmount: parseBigNumber(maxOpenLongQuoteAmountByLiquidityString)
          .div(parseBigNumber(price))
          .toString(),
      }
    }

    return {
      quoteAmount: collateralAmountValue.toString(),
      baseAmount: collateralAmountValue.div(parseBigNumber(price)).toString(),
    }
  }, [
    poolLiquidityInfo,
    leverage,
    autoMarginMode,
    collateralAmount,
    walletBalance,
    symbolInfo,
    autoMarginMode,
    price,
    walletBalance,
  ])

  return {
    maxOpenLong: {
      quoteAmount: maxOpenLongAmount.quoteAmount ?? '0',
      baseAmount: maxOpenLongAmount.baseAmount ?? '0',
    },
    maxOpenShort: {
      quoteAmount: maxOpenShortAmount.quoteAmount ?? '0',
      baseAmount: maxOpenShortAmount.baseAmount ?? '0',
    },
  }
}
