/**
 * 深度图 - 独立插件，零项目依赖
 * 传入 bids、asks 即可渲染，支持自定义颜色
 */

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { transformOrderBookToChartData, DEFAULT_DEPTH_CHART_COLORS } from './utils'
import { DepthChartCanvas } from './DepthChartCanvas'
import type { DepthChartProps, DepthChartColors } from './types'

/**
 * 深度图组件
 *
 * @example
 * ```tsx
 * import { DepthChart } from 'depth-chart'
 *
 * <DepthChart
 *   bids={[['100', '10'], ['99', '20']]}
 *   asks={[['101', '15'], ['102', '25']]}
 *   unit="USDT"
 *   lastPrice="100.5"
 *   colors={{ buyColor: '#00B26A', sellColor: '#F6465D' }}
 * />
 * ```
 */
export const DepthChart: React.FC<DepthChartProps> = ({
  bids = [],
  asks = [],
  chartData: chartDataProp,
  unit = '',
  lastPrice,
  pricePrecision = 2,
  amountPrecision = 2,
  colors = {},
  className = '',
  style = {},
  renderTooltip,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateSize()
    const observer = new ResizeObserver(updateSize)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const chartData = useMemo(
    () => chartDataProp ?? transformOrderBookToChartData(bids, asks, unit),
    [chartDataProp, bids, asks, unit],
  )

  const mergedColors = useMemo(
    (): Required<DepthChartColors> => ({
      buyColor: colors.buyColor ?? DEFAULT_DEPTH_CHART_COLORS.buyColor,
      buyOpacityColor: colors.buyOpacityColor ?? DEFAULT_DEPTH_CHART_COLORS.buyOpacityColor,
      sellColor: colors.sellColor ?? DEFAULT_DEPTH_CHART_COLORS.sellColor,
      sellOpacityColor: colors.sellOpacityColor ?? DEFAULT_DEPTH_CHART_COLORS.sellOpacityColor,
      axisColor: colors.axisColor ?? DEFAULT_DEPTH_CHART_COLORS.axisColor,
      tooltipBgColor: colors.tooltipBgColor ?? DEFAULT_DEPTH_CHART_COLORS.tooltipBgColor,
      tooltipTextColor: colors.tooltipTextColor ?? DEFAULT_DEPTH_CHART_COLORS.tooltipTextColor,
    }),
    [colors],
  )

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 200,
        backgroundColor: '#f5f5f5',
        ...style,
      }}
    >
      {dimensions.width > 0 && dimensions.height > 0 && (
        <DepthChartCanvas
          data={chartData}
          colors={mergedColors}
          lastPrice={lastPrice}
          pricePrecision={pricePrecision}
          amountPrecision={amountPrecision}
          width={dimensions.width}
          height={dimensions.height}
          renderTooltip={renderTooltip}
        />
      )}
    </div>
  )
}

export type {
  DepthChartProps,
  DepthChartColors,
  OrderBookItem,
  DepthChartDataItem,
  DepthChartTooltipItem,
} from './types'
