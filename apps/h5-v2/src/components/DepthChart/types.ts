/**
 * 深度图类型定义
 */

import type { CSSProperties, ReactNode } from 'react'

/** 原始盘口数据项：[价格, 数量] 或 [价格, 数量, 累计总量] */
export type OrderBookItem = [string, string] | [string, string, string]

/** 转换后的图表数据项 */
export interface DepthChartDataItem {
  price: string
  amount: string
  total: string
  unit: string
}

/** 深度图颜色配置 */
export interface DepthChartColors {
  /** 买单线条和描边颜色 */
  buyColor?: string
  /** 买单区域填充色（半透明） */
  buyOpacityColor?: string
  /** 卖单线条和描边颜色 */
  sellColor?: string
  /** 卖单区域填充色（半透明） */
  sellOpacityColor?: string
  /** 坐标轴颜色 */
  axisColor?: string
  /** 悬浮提示框背景色 */
  tooltipBgColor?: string
  /** 悬浮提示框文字颜色 */
  tooltipTextColor?: string
}

/** Tooltip 数据项（用于自定义 renderTooltip） */
export interface DepthChartTooltipItem {
  x: number
  y: number
  value: DepthChartDataItem
  side: 'buy' | 'sell'
  priceRange: string
}

/** 深度图组件 Props */
export interface DepthChartProps {
  /** 买单数据 [[价格, 数量], ...] 或 [[价格, 数量, 累计总量], ...] */
  bids?: OrderBookItem[]
  /** 卖单数据 [[价格, 数量], ...] 或 [[价格, 数量, 累计总量], ...] */
  asks?: OrderBookItem[]
  /** 已处理好的图表数据，传入时优先使用 */
  chartData?: { buy: DepthChartDataItem[]; sell: DepthChartDataItem[] }
  /** 数量单位，如 USDT、张 */
  unit?: string
  /** 最新价，用于计算价差百分比 */
  lastPrice?: string
  /** 价格精度（小数位数） */
  pricePrecision?: number
  /** 数量精度（小数位数） */
  amountPrecision?: number
  /** 颜色配置 */
  colors?: DepthChartColors
  /** 自定义 className */
  className?: string
  /** 自定义 style */
  style?: CSSProperties
  /** 自定义 renderTooltip，传入 (item, position) 返回 JSX，可完全自定义样式 */
  renderTooltip?: (
    item: DepthChartTooltipItem,
    position: { left: number; top: number },
  ) => ReactNode
}
