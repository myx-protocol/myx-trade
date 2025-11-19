import { isSafeNumber } from '@/utils/index.ts'
import { isNil } from 'lodash-es'
import { formatUnits, parseUnits } from 'ethers'
import {
  COMMON_PERCENT_DISPLAY_DECIMALS,
  COMMON_PRICE_DISPLAY_DECIMALS,
} from '@/constant/decimals.ts'

export function formatNumberPercent(
  value?: number | string | bigint,
  precision: number = COMMON_PERCENT_DISPLAY_DECIMALS,
  sign: boolean = true,
  isThousandBitSeparator = true,
  empty: string = '--',
): string {
  if (isSafeNumber(value)) {
    const number = Number(value)
    const _sign = sign && number >= 0 ? '+' : ''
    const reg = new RegExp(`([0-9]+.[0-9]{${precision + 2}})[0-9]*`, 'g')
    let num = (+`${value}`.replace(reg, '$1')).toFixed(precision + 2)
    num = (+num * 100).toFixed(precision)
    if (isThousandBitSeparator) {
      return `${_sign}${thousandBitSeparator(num)}%`
    }
    return `${_sign}${num}%`
  } else {
    return empty
  }
}

export function formatNumberPrecision(
  value: any,
  precision: number = COMMON_PRICE_DISPLAY_DECIMALS,
  sign: boolean = false,
  isThousandBitSeparator: boolean = true,
  empty: string = '--',
): string {
  if (isSafeNumber(value)) {
    const sValue = `${value}`
    const reg = new RegExp(`([0-9]+.[0-9]{${precision}})[0-9]*`, 'g')
    const num = (+sValue.replace(reg, '$1')).toFixed(precision)
    const _sign = sign && Number(value) > 0 ? '+' : ''
    if (isThousandBitSeparator) {
      return `${_sign}${thousandBitSeparator(num)}`
    }
    return `${_sign}${num}`
  }
  return empty
}

function formatNumberLocale(num: number, locale = 'en-US') {
  return new Intl.NumberFormat(locale).format(Number(num))
}
export function thousandBitSeparator(num: number | string): string {
  if (Number.isNaN(Number(num)) || Math.abs(Number(num)) < 1000) {
    return num.toString()
  }

  return formatNumberLocale(Number(num))
}

export function formatNumberString(valueString: string) {
  const reg = new RegExp(/(\d+)(\.\d+)?([BKMbkm])?/g)
  return valueString.replace(reg, (_match, $1, $2, $3) => {
    return thousandBitSeparator(Number($1)) + ($2 || '') + ($3 || '')
  })
}

export function parseNumberStringToBigInt(
  value: number | string,
  precision: number,
): bigint | undefined {
  if (isNil(value)) {
    return undefined
  }

  if (isNil(precision)) {
    return undefined
  }

  return parseUnits(value.toString(), precision)
}

export function parseBigIntToNumberString(value?: bigint, precision?: number): string | undefined {
  if (isNil(value) || typeof value !== 'bigint') {
    return undefined
  }

  if (isNil(precision)) {
    return undefined
  }

  return formatUnits(value, precision)
}

export function minBigInt<T extends bigint>(...values: T[]): bigint {
  if (values.length === 0) {
    // 根据需求，可以抛错或返回 undefined
    throw new Error('Expected at least one value')
  }
  let min = values[0] as bigint
  for (const v of values.slice(1)) {
    // 值会自动比较 bigint 与 number
    if (v < min) min = v
  }
  return min
}

export function maxBigInt<T extends bigint>(...values: T[]): bigint {
  if (values.length === 0) {
    throw new Error('Expected at least one value')
  }
  let max = values[0] as bigint
  for (const v of values.slice(1)) {
    if (v > max) max = v
  }
  return max
}
