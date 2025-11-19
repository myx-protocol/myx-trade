import Big from 'big.js'

/**
 * 将字符串或数字转换为 Big.js 实例
 * @param value 要转换的值
 * @returns Big.js 实例
 */
export const parseBigNumber = (value: string | number | Big): Big => {
  if (value instanceof Big) {
    return value
  }

  if (typeof value === 'string') {
    // 处理空字符串或只包含小数点的字符串
    if (value === '' || value === '.') {
      return new Big(0)
    }
    return new Big(value)
  }

  if (typeof value === 'number') {
    return new Big(value)
  }

  return new Big(0)
}

/**
 * 格式化数字为字符串，支持千分位分隔符
 * @param value Big.js 实例或数字
 * @param options 格式化选项
 * @returns 格式化后的字符串
 */
export const formatBigNumber = (
  value: Big | number | string,
  options: {
    decimals?: number
    thousandsSeparator?: string
    decimalSeparator?: string
  } = {},
): string => {
  const { decimals = 2, thousandsSeparator = ',', decimalSeparator = '.' } = options

  const bigValue = parseBigNumber(value)

  // 转换为固定小数位的字符串
  const formatted = bigValue.toFixed(decimals)

  // 添加千分位分隔符
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)

  return parts.join(decimalSeparator)
}

/**
 * 检查数值是否在允许范围内
 * @param value 要检查的值
 * @param max 最大值
 * @param min 最小值
 * @returns 是否在范围内
 */
export const isValueInRange = (
  value: Big | number | string,
  max?: Big | number | string,
  min?: Big | number | string,
): boolean => {
  const bigValue = parseBigNumber(value)

  if (max !== undefined) {
    const bigMax = parseBigNumber(max)
    if (bigValue.gt(bigMax)) {
      return false
    }
  }

  if (min !== undefined) {
    const bigMin = parseBigNumber(min)
    if (bigValue.lt(bigMin)) {
      return false
    }
  }

  return true
}

/**
 * 限制数值在指定范围内
 * @param value 要限制的值
 * @param max 最大值
 * @param min 最小值
 * @returns 限制后的 Big.js 实例
 */
export const clampBigNumber = (
  value: Big | number | string,
  max?: Big | number | string,
  min?: Big | number | string,
): Big => {
  let bigValue = parseBigNumber(value)

  if (max !== undefined) {
    const bigMax = parseBigNumber(max)
    if (bigValue.gt(bigMax)) {
      bigValue = bigMax
    }
  }

  if (min !== undefined) {
    const bigMin = parseBigNumber(min)
    if (bigValue.lt(bigMin)) {
      bigValue = bigMin
    }
  }

  return bigValue
}
