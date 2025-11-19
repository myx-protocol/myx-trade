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
        mulPrecision(unreservedQuote, quoteRatio, precision),
        price,
        new Big(1),
      )
      availableSize = unreservedBase.plus(unreservedQuoteSize)
    } else {
      const quoteSize = quoteTotal.div(price)
      const baseSize = divPrecision(baseTotal, baseRatio, precision)
      availableSize = tracker.plus(quoteSize).plus(baseSize)
    }
  } else {
    if (isBuy) {
      const quoteSize = divPrecision(
        mulPrecision(quoteTotal, quoteRatio, precision),
        price,
        new Big(1),
      )
      const trackerAbs = tracker.abs()
      availableSize = trackerAbs.plus(baseTotal).plus(quoteSize)
    } else {
      const unreservedQuoteSize = unreservedQuote.div(price)
      const adjustedBase = divPrecision(unreservedBase, baseRatio, precision)
      availableSize = unreservedQuoteSize.plus(adjustedBase)
    }
  }

  return availableSize.toFixed(0) // 是否取整按需要调整
}
