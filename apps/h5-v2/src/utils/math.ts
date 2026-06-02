import Big from 'big.js'
import { DECIMAL_ROUND } from '@/constant/regexp'
import { isNull } from 'lodash-es'
import { decimalToPercent, type PercentFormatOptions } from './number'

export const plus = (a: number | string | Big, b: number | string | Big): Big => {
  if (isNull(a) || isNull(b)) return new Big(0)
  return new Big(a).plus(b)
}

export const minus = (a: number | string | Big, b: number | string | Big): Big => {
  if (isNull(a) || isNull(b)) return new Big(0)
  return new Big(a).minus(b)
}

export const mul = (a: number | string | Big, b: number | string | Big): Big => {
  if (isNull(a) || isNull(b)) return new Big(0)
  return new Big(a).mul(b)
}

export const div = (a: number | string | Big, b: number | string | Big): Big => {
  if (isNull(a) || isNull(b)) return new Big(0)
  return new Big(a).div(b)
}

export const decimalRound = (value: string): string => {
  return value.replace(DECIMAL_ROUND, '$1')
}

export const getDecimal = (decimal: number): string => {
  let str = '0.'
  let current = 1
  while (current < decimal) {
    str += '0'
    current += 1
  }
  return `${str}1`
}

/**
 * calculate the profit rate with precision
 */
export const getProfitRatePrecision = (realizedPnl: string, collateralAmount: string): string => {
  const profitRateDecimal = Big(realizedPnl).div(collateralAmount)
  return decimalToPercent(profitRateDecimal, {
    decimals: 2,
    showSign: true,
  })
}
