/**
 * 深度图工具函数 - 无外部依赖
 */

import Big from 'big.js'
import type { DepthChartDataItem, OrderBookItem } from './types'

/** 默认颜色配置 */
export const DEFAULT_DEPTH_CHART_COLORS = {
  buyColor: '#00B26A',
  buyOpacityColor: 'rgba(0, 178, 106, 0.2)',
  sellColor: '#F6465D',
  sellOpacityColor: 'rgba(246, 70, 93, 0.2)',
  axisColor: 'rgba(200, 200, 200, 0.5)',
  tooltipBgColor: 'rgba(4, 9, 26, 0.8)',
  tooltipTextColor: '#fff',
}

/** 千分位格式化 */
export function thousandsSeparator(n: string | number): string {
  if (n == null || n === '' || /,/.test(String(n))) return String(n)
  const str = String(n)
  const reg = /^[-+]?[1-9]\d*(\.\d+)?/
  const match = str.match(reg)?.[0]
  if (!match) return str
  const extra = str.split(match).join('')
  const strSplit = match.startsWith('-') ? match.replace(/^-/, '').split('.') : match.split('.')
  const integer = strSplit[0].split('')
  integer.reverse()
  const decimal = strSplit[1]
  const newInteger: string[] = []
  for (let i = 0; i < integer.length; i++) {
    if (i % 3 === 0 && i !== 0) newInteger.push(',')
    newInteger.push(integer[i])
  }
  newInteger.reverse()
  let s = newInteger.join('')
  if (decimal) s += `.${decimal}`
  if (extra) s += extra
  return match.startsWith('-') ? `-${s}` : s
}

/** 连续小数格式化，支持精度 */
export function formatContinuousDecimal(str: string, precision?: number | string): string {
  if (!str) return str
  try {
    const strValue = String(str)
    const formatFun = (value: string) => {
      const part = value.split('.')
      if (part.length < 2) return value
      const formatDecimalPart = part[1].replace(/(0+)(?=[1-9])/g, (match) =>
        match.length >= 7 ? `0{${match.length}}` : match,
      )
      return `${part[0]}.${formatDecimalPart}`
    }
    if (precision != null) {
      const precisionValue = parseFloat(strValue).toFixed(Number(precision))
      return formatFun(precisionValue)
    }
    return formatFun(strValue)
  } catch {
    return str
  }
}

/**
 * 将原始 bids/asks 转换为深度图所需格式
 */
export function transformOrderBookToChartData(
  bids: OrderBookItem[],
  asks: OrderBookItem[],
  unit = '',
): { buy: DepthChartDataItem[]; sell: DepthChartDataItem[] } {
  const data: { buy: DepthChartDataItem[]; sell: DepthChartDataItem[] } = { buy: [], sell: [] }

  if (asks?.length > 0) {
    let cumulativeTotal = 0
    const sellList = asks
      .filter((item) => Number(item[1]) > 0)
      .map((item) => {
        const price = String(item[0])
        const amount = String(item[1])
        cumulativeTotal = Big(cumulativeTotal).plus(amount).toNumber()
        return { price, amount, total: String(cumulativeTotal), unit }
      })
    sellList.reverse()
    data.sell = sellList
  }

  if (bids?.length > 0) {
    let cumulativeTotal = 0
    data.buy = bids
      .filter((item) => Number(item[1]) > 0)
      .map((item) => {
        const price = String(item[0])
        const amount = String(item[1])
        cumulativeTotal = Big(cumulativeTotal).plus(amount).toNumber()
        return { price, amount, total: String(cumulativeTotal), unit }
      })
  }

  return data
}
