import Big from 'big.js'
Big.DP = 80
Big.RM = Big.roundDown

const RESERVE_RATIO_PRECISION = '100'

function divPrecision(value: Big, ratio: Big, precision: Big): Big {
  return value.times(precision).div(ratio)
}

function mulPrecision(value: Big, ratio: Big, precision: Big): Big {
  return value.times(ratio).div(precision)
}

// executePrice decimals 30
export function availableLiquiditySizeWad(params: {
  baseTotalAmountWad: string
  quoteTotalAmountWad: string
  baseReservedAmountWad: string
  quoteReservedAmountWad: string
  baseReserveRatio: string
  quoteReserveRatio: string
  isLongBiased: boolean
  trackerWad: string
  isBuy: boolean
  executePrice: string
}): string {
  const {
    baseTotalAmountWad,
    quoteTotalAmountWad,
    baseReservedAmountWad,
    quoteReservedAmountWad,
    baseReserveRatio,
    quoteReserveRatio,
    isLongBiased,
    trackerWad,
    isBuy,
    executePrice,
  } = params

  // 这几个值需要统一转为18位
  const baseTotal = new Big(baseTotalAmountWad)
  const quoteTotal = new Big(quoteTotalAmountWad)
  const baseReserved = new Big(baseReservedAmountWad)
  const quoteReserved = new Big(quoteReservedAmountWad)
  const tracker = new Big(trackerWad) // tracker当前 为base精度

  //
  const baseRatio = new Big(baseReserveRatio)
  const quoteRatio = new Big(quoteReserveRatio)
  const price = new Big(executePrice)
  const precision = new Big(RESERVE_RATIO_PRECISION)

  const unreservedBase = baseTotal.minus(baseReserved)
  const unreservedQuote = quoteTotal.minus(quoteReserved)

  let availableSize: Big

  if (isLongBiased) {
    if (isBuy) {
      const unreservedQuoteSize = divPrecision(
        unreservedQuote,
        mulPrecision(price, quoteRatio, precision),
        new Big(10 ** 30),
      )
      availableSize = unreservedBase.plus(unreservedQuoteSize)
    } else {
      const quoteSize = divPrecision(quoteTotal, price, new Big(10 ** 30))
      const baseSize = divPrecision(baseTotal, baseRatio, precision)
      availableSize = tracker.plus(quoteSize).plus(baseSize)
    }
  } else {
    if (isBuy) {
      const quoteSize = divPrecision(
        quoteTotal,
        mulPrecision(price, quoteRatio, precision),
        new Big(10 ** 30),
      )
      const trackerAbs = tracker.abs()
      availableSize = trackerAbs.plus(baseTotal).plus(quoteSize)
    } else {
      const unreservedQuoteSize = divPrecision(unreservedQuote, price, new Big(10 ** 30))
      const adjustedBase = divPrecision(unreservedBase, baseRatio, precision)
      availableSize = unreservedQuoteSize.plus(adjustedBase)
    }
  }

  return availableSize.toFixed(0) // 是否取整按需要调整
}
