/**
 * 截取字符串，指定开始几位以及结束几位，超过要截取的长度使用指定的符号拼接
 * @param str 要截取的字符串
 * @param startLength 开始保留的字符数
 * @param endLength 结束保留的字符数
 * @param separator 中间连接的符号，默认为 '...'
 * @returns 截取后的字符串
 */
export const truncateString = (
  str: string,
  startLength: number,
  endLength: number,
  separator: string = '...',
): string => {
  if (!str) return ''

  const totalLength = startLength + endLength
  const strLength = str.length

  // 如果字符串长度小于等于要保留的总长度，直接返回原字符串
  if (strLength <= totalLength) {
    return str
  }

  // 如果开始长度或结束长度为0，只保留一边
  if (startLength === 0) {
    return str.slice(-endLength)
  }

  if (endLength === 0) {
    return str.slice(0, startLength)
  }

  // 截取开始和结束部分
  const startPart = str.slice(0, startLength)
  const endPart = str.slice(-endLength)

  return `${startPart}${separator}${endPart}`
}

/**
 * 截取地址字符串的便捷方法，常用于显示钱包地址
 * @param address 地址字符串
 * @param startLength 开始保留的字符数，默认为6
 * @param endLength 结束保留的字符数，默认为4
 * @returns 截取后的地址字符串
 */
export const truncateAddress = (
  address: string,
  startLength: number = 4,
  endLength: number = 4,
): string => {
  return truncateString(address, startLength, endLength, '...')
}
