import Big, { type BigSource } from 'big.js'

Big.RM = Big.roundDown

const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']

export const isSuperDecimal = (value: number | string) => {
  const valueBig = new Big(value)
  return valueBig.abs().lt(0.000001) && valueBig.abs().gt(0)
}

export const getSuperDecimalScale = (value: number) => {
  const valueBig = new Big(value)
  const isNegative = valueBig.lt(0)
  const absValue = isNegative ? valueBig.abs() : valueBig

  const decimalPart = new Big(absValue).toFixed(30).split('.')[1] || ''
  const firstNonZeroIndex = decimalPart.search(/[1-9]/)

  return firstNonZeroIndex === -1 ? 6 : firstNonZeroIndex + 1 + 4
}

const stripTrailingDecimalZeros = (s: string): string => {
  const dotIndex = s.indexOf('.')
  if (dotIndex === -1) return s
  const intPart = s.slice(0, dotIndex)
  const decPart = s.slice(dotIndex + 1).replace(/0+$/, '')
  return decPart ? `${intPart}.${decPart}` : intPart
}

const formatSuperDecimal = (
  value: number,
  options?: Pick<NumberFormatOptions, 'showSign'>,
): string => {
  if (!Number.isFinite(value) || !isSuperDecimal(value)) {
    return value.toString()
  }

  const isNegative = value < 0
  const absValue = Math.abs(value)

  const decimalPart = new Big(absValue).toFixed(30).split('.')[1] || ''
  const firstNonZeroIndex = decimalPart.search(/[1-9]/)

  if (firstNonZeroIndex === -1) {
    return value.toString()
  }

  const zeroCount = firstNonZeroIndex
  // remove trailing zeros
  const significantDigits = decimalPart
    .slice(firstNonZeroIndex, firstNonZeroIndex + 4)
    .replace(/0+$/, '')
  const subscript = zeroCount
    .toString()
    .split('')
    .map((digit) => subscriptDigits[Number(digit)])
    .join('')
  const formatted = `0.0${subscript}${significantDigits}`
  // add minus sign
  if (isNegative) {
    return `-${formatted}`
  }
  // add plus sign
  if (options?.showSign) {
    return `+${formatted}`
  }
  // default return
  return formatted
}

export const autoPriceDecimals = (value: number) => {
  if (value >= 1000) {
    return 2
  }
  if (value >= 1) {
    return 4
  }
  return 6
}
/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
  /** 小数位数，默认为2 */
  decimals?: number
  /** 是否显示千分位分隔符，默认为true */
  showThousandsSeparator?: boolean
  /** 千分位分隔符，默认为',' */
  thousandsSeparator?: string
  /** 是否显示单位，默认为true */
  showUnit?: boolean
  /** 是否为正数添加+号，默认为false */
  showSign?: boolean
  fallback?: string
}

/**
 * 将数字转换为相对单位（K, M, B）并添加千分位分隔符
 * @param num 要格式化的数字
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export const formatNumber = (num?: BigSource, options: NumberFormatOptions = {}): string => {
  const {
    decimals = undefined,
    showThousandsSeparator = true,
    thousandsSeparator = ',',
    showUnit = true,
    showSign = false,
    fallback = '--',
  } = options

  if (num === null || num === undefined || num === '' || Number.isNaN(Number(num))) {
    return fallback
  }

  let decimalsValue = decimals

  // 使用 Big.js 处理数字，避免精度问题和科学计数法
  let bigValue: Big
  try {
    bigValue = typeof num === 'string' ? new Big(num) : new Big(num)
  } catch {
    // 处理无效数字，根据 decimals 返回对应的精度
    return '0'
  }

  // 处理零值
  if (bigValue.eq(0)) {
    return '0'
  }

  if (isSuperDecimal(bigValue.toNumber())) {
    return formatSuperDecimal(bigValue.toNumber(), { showSign })
  } else if (decimalsValue === undefined) {
    decimalsValue = autoPriceDecimals(bigValue.abs().toNumber())
  }
  // 处理负数
  const isNegative = bigValue.lt(0)
  const isPositive = bigValue.gt(0)
  const absValue = isNegative ? bigValue.abs() : bigValue

  let result: string

  if (showUnit) {
    // 需要单位转换
    const units = ['', 'K', 'M', 'B', 'T']

    let unitIndex = 0
    let value = absValue
    const thousand = new Big(1000)

    while (value.gte(thousand) && unitIndex < units.length - 1) {
      value = value.div(thousand)
      unitIndex++
    }

    // 格式化小数位
    const formattedValue = value.toFixed(decimalsValue)
    const [integerPart, decimalPart] = formattedValue.split('.')

    // 添加千分位分隔符
    result = integerPart
    if (showThousandsSeparator) {
      result = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    }

    // 添加小数部分（根据 decimals 参数决定是否显示）
    if (decimalsValue > 0 && decimalPart) {
      result += '.' + decimalPart
    }

    // 添加单位
    if (units[unitIndex]) {
      result += units[unitIndex]
    }
  } else {
    // 不进行单位转换，直接格式化原始数值
    const formattedValue = absValue.toFixed(decimalsValue)
    const [integerPart, decimalPart] = formattedValue.split('.')

    // 添加千分位分隔符
    result = integerPart
    if (showThousandsSeparator) {
      result = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)
    }

    // 添加小数部分（根据 decimals 参数决定是否显示）
    if (decimalsValue > 0 && decimalPart) {
      result += '.' + decimalPart
    }
  }

  result = stripTrailingDecimalZeros(result)

  // 添加负号
  if (isNegative) {
    result = '-' + result
  }

  // add plus sign
  if (showSign && isPositive) {
    result = '+' + result
  }

  return result
}

export const formatPriceDisplay = (price: string) => {
  // 如果是空字符串，返回原样
  if (!price) {
    return price
  }

  // 如果正在输入小数（以小数点结尾，或只有0和小数点），返回原样
  if (price.endsWith('.') || /^0\.0*$/.test(price)) {
    return price
  }

  const numPrice = parseFloat(price)

  if (isNaN(numPrice)) {
    return price // 保持原样
  }

  if (numPrice < 0) {
    return '0'
  }

  if (numPrice === 0) {
    return '0'
  }

  if (numPrice >= 1000) {
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  if (numPrice >= 1) {
    return numPrice.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })
  }

  if (numPrice >= 0.001) {
    return numPrice.toFixed(6)
  }

  const priceStr = numPrice.toString()

  let decimalStr: string
  if (priceStr.includes('e')) {
    decimalStr = numPrice.toFixed(20)
  } else {
    decimalStr = priceStr
  }

  const afterDecimal = decimalStr.split('.')[1] || ''

  let zeroCount = 0
  for (let i = 0; i < afterDecimal.length; i++) {
    if (afterDecimal[i] === '0') {
      zeroCount++
    } else {
      break
    }
  }

  const significantPart = afterDecimal.slice(zeroCount, zeroCount + 4)

  const subscriptDigits = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
  const zeroCountStr = zeroCount
    .toString()
    .split('')
    .map((d) => subscriptDigits[parseInt(d)])
    .join('')

  return `0.0${zeroCountStr}${significantPart}`
}

/**
 * 格式化金额显示
 * @param amount 金额字符串
 * @param decimals 保留的小数位数，不传则使用智能显示（根据价格大小自动调整精度）
 * @param showThousandsSeparator 是否显示千分位分隔符，默认为 true
 * @returns 格式化后的字符串
 */
export const displayAmount = (
  amount: string,
  decimals?: number,
  showThousandsSeparator: boolean = true,
): string => {
  const num = parseFloat(amount)

  if (isNaN(num)) {
    return amount
  }

  const abs = Math.abs(num)

  // 十亿及以上: b
  if (abs >= 1_000_000_000) {
    const value = abs / 1_000_000_000
    const valueStr = value.toString()

    // 如果未指定 decimals，使用智能显示
    if (decimals === undefined) {
      const formatted = formatPriceDisplay(valueStr)
      return (num < 0 ? '-' : '') + formatted + 'b'
    }

    // 使用指定的 decimals 截断
    const multiplier = Math.pow(10, decimals)
    const truncated = Math.floor(value * multiplier) / multiplier
    const formatted = formatNumberWithSeparator(truncated, decimals, showThousandsSeparator)

    return (num < 0 ? '-' : '') + formatted + 'b'
  }

  // 小于十亿
  // 如果未指定 decimals，使用智能显示
  if (decimals === undefined) {
    return formatPriceDisplay(amount)
  }

  // 使用指定的 decimals 格式化
  return formatNumberWithSeparator(num, decimals, showThousandsSeparator)
}

/**
 * 格式化数字，添加千分位分隔符
 * @param num 数字
 * @param decimals 保留的小数位数
 * @param showThousandsSeparator 是否显示千分位分隔符
 * @returns 格式化后的字符串
 */
function formatNumberWithSeparator(
  num: number,
  decimals: number,
  showThousandsSeparator: boolean,
): string {
  const isNegative = num < 0
  const abs = Math.abs(num)

  // 截断到指定小数位
  const multiplier = Math.pow(10, decimals)
  const truncated = Math.floor(abs * multiplier) / multiplier

  // 分离整数和小数部分
  const parts = truncated.toFixed(decimals).split('.')
  let integerPart = parts[0]
  const decimalPart = parts[1]

  // 添加千分位分隔符
  if (showThousandsSeparator && integerPart.length > 3) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // 组合结果
  let result = integerPart

  // 添加小数部分（去除尾部的零）
  if (decimals > 0 && decimalPart) {
    const trimmedDecimal = decimalPart.replace(/0+$/, '')
    if (trimmedDecimal) {
      result += '.' + trimmedDecimal
    }
  }

  return (isNegative ? '-' : '') + result
}

/**
 * 格式化百分比数字
 * 支持最大值，小数位数，是否舍去末尾的0，是否显示正负号
 */
export interface PercentFormatOptions {
  max?: number
  min?: number
  decimals?: number // 小数
  removeTrailingZeros?: boolean //是否舍去末尾的0
  showSign?: boolean // 是否显示正负号
}
export const decimalToPercent = (decimal: Big.BigSource, options?: PercentFormatOptions) => {
  // options default value
  const MAX_VALUE = options?.max || 9999 // default 9999
  const MIN_VALUE = options?.min || -9999 // default -9999
  const decimals = options?.decimals || 4 // default 4 decimals
  const showSign = options?.showSign || false
  const removeTrailingZeros = options?.removeTrailingZeros || false
  if (isNaN(Number(decimal))) {
    return '0%'
  }
  // format precent number
  const precentNumber = Big(decimal).abs().mul(100)
  if (precentNumber.gt(MAX_VALUE)) {
    if (Big(decimal).gt(0)) {
      return `>${MAX_VALUE}%`
    }
    return `<${MIN_VALUE}%`
  }

  // format precent number to string
  let result = precentNumber.toFixed(decimals)
  if (removeTrailingZeros) {
    result = result.replace(/0+$/, '').replace(/\.$/, '')
  }
  // add plus sign
  if (showSign && Big(decimal).gt(0)) {
    result = '+' + result
  }
  if (Big(decimal).lt(0)) {
    result = '-' + result
  }
  // add percent sign
  return result + '%'
}

/**
 * format base token amount
 */

export const formatNumberWithBaseToken = (number: BigSource, options?: NumberFormatOptions) => {
  const decimals = options?.decimals || 4
  return formatNumber(number, {
    ...options,
    decimals,
  })
}
