/**
 * 深度图 Canvas 绘制组件
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { DepthChartDataItem } from './types'
import { DEFAULT_DEPTH_CHART_COLORS, thousandsSeparator, formatContinuousDecimal } from './utils'
import type { DepthChartColors, DepthChartTooltipItem } from './types'
import { formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'

type TempChartDataItem = { x: number; y: number; value: DepthChartDataItem; side: string }

const GAP = 3
const X_AXIS_HEIGHT = 24
const Y_AXIS_WIDTH = 60
const PADDING_TOP = 0

function resolveDevicePixelRatioScale(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
) {
  const dpr = window.devicePixelRatio || 1
  canvas.style.width = canvas.width + 'px'
  canvas.style.height = canvas.height + 'px'
  canvas.width = dpr * canvas.getBoundingClientRect().width
  canvas.height = dpr * canvas.getBoundingClientRect().height
  context.scale(dpr, dpr)
}

function getTipsLeft(x: number, width: number, maxTextWidth: number, side: string): number {
  let left = 0
  if (side === 'sell') left = x - width / 2 < maxTextWidth ? x : x - maxTextWidth
  if (side === 'buy') left = width / 2 - x > maxTextWidth ? x : x - maxTextWidth
  return Math.max(0, Math.min(left, width - maxTextWidth))
}

interface DepthChartCanvasProps {
  data: { buy: DepthChartDataItem[]; sell: DepthChartDataItem[] }
  colors: Required<DepthChartColors>
  lastPrice?: string
  pricePrecision: number
  amountPrecision: number
  width: number
  height: number
  renderTooltip?: (
    item: DepthChartTooltipItem,
    position: { left: number; top: number },
  ) => React.ReactNode
}

export const DepthChartCanvas: React.FC<DepthChartCanvasProps> = ({
  data,
  colors,
  lastPrice,
  pricePrecision,
  amountPrecision,
  width,
  height,
  renderTooltip: renderTooltipProp,
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartMaskRef = useRef<HTMLCanvasElement>(null)
  const chartXRef = useRef<HTMLCanvasElement>(null)
  const chartYRef = useRef<HTMLCanvasElement>(null)
  const valueMap = useRef(
    new Map<string, { currentValue: DepthChartDataItem; oppositeValue: TempChartDataItem }>(),
  )
  const chartDataRef = useRef(data)
  const lastMoveOffsetX = useRef('')
  const [hoverData, setHoverData] = useState<{
    buyItem: TempChartDataItem | null
    sellItem: TempChartDataItem | null
  } | null>(null)

  const drawWidth = width - Y_AXIS_WIDTH
  const drawHeight = height - X_AXIS_HEIGHT

  const generateFormatValue = useCallback(
    (value: string) => formatNumber(value, { decimals: pricePrecision, showUnit: false }),
    [pricePrecision],
  )

  const getPriceRangeData = useCallback(
    (price: number): string => {
      if (!lastPrice || !Number(lastPrice)) return '--'
      const calcPrice = ((Number(lastPrice) - price) / Number(lastPrice)) * 100
      return !isFinite(calcPrice) ? '--' : `${calcPrice.toFixed(pricePrecision)}%`
    },
    [lastPrice, pricePrecision],
  )

  const drawDepthChart = useCallback(
    (
      context: CanvasRenderingContext2D,
      chartData: { buy: DepthChartDataItem[]; sell: DepthChartDataItem[] },
      publicData: { maxAmount: number; scaleW: number; w: number; h: number },
    ) => {
      const tempList: TempChartDataItem[] = []
      const { maxAmount, scaleW, w, h } = publicData
      const buyColor = colors.buyColor ?? DEFAULT_DEPTH_CHART_COLORS.buyColor
      const sellColor = colors.sellColor ?? DEFAULT_DEPTH_CHART_COLORS.sellColor
      const buyOpacity = colors.buyOpacityColor ?? DEFAULT_DEPTH_CHART_COLORS.buyOpacityColor
      const sellOpacity = colors.sellOpacityColor ?? DEFAULT_DEPTH_CHART_COLORS.sellOpacityColor

      context.beginPath()
      if (chartData.buy?.length) {
        context.moveTo(w / 2 - GAP, h)
        for (const i in chartData.buy) {
          const item = chartData.buy[i]
          const total = parseFloat(item.total)
          let y = h - (total / maxAmount) * h + PADDING_TOP
          if (y > h - PADDING_TOP) y = h - PADDING_TOP
          const x = w / 2 - Number(i) * scaleW - GAP
          tempList.push({ x, y, value: item, side: 'buy' })
          context.lineTo(x, y)
        }
        context.lineTo(0, tempList[tempList.length - 1]?.y ?? h)
        context.strokeStyle = buyColor
        context.lineWidth = 1
        context.stroke()
        context.lineTo(0, h)
        context.lineTo(w / 2 - GAP, h)
        context.fillStyle = buyOpacity
        context.fill()
        context.closePath()
      }

      if (chartData.sell?.length) {
        context.beginPath()
        context.moveTo(w / 2 + GAP, h)
        for (const i in chartData.sell) {
          const index = chartData.sell.length - Number(i) - 1
          const item = chartData.sell[index]
          const total = parseFloat(item?.total ?? '0')
          if (total) {
            let y = h - (total / maxAmount) * h + PADDING_TOP
            if (y > h - PADDING_TOP) y = h - PADDING_TOP
            const x = w / 2 + Number(i) * scaleW + GAP
            tempList.push({ x, y, value: item, side: 'sell' })
            context.lineTo(x, y)
          }
        }
        const lastSell = tempList.filter((t) => t.side === 'sell').pop()
        context.lineTo(w + GAP, lastSell?.y ?? h)
        context.strokeStyle = sellColor
        context.lineWidth = 1
        context.stroke()
        context.lineTo(w + GAP, h)
        context.lineTo(w / 2 + GAP, h)
        context.fillStyle = sellOpacity
        context.fill()
        context.closePath()
      }

      const axisColor = colors.axisColor ?? DEFAULT_DEPTH_CHART_COLORS.axisColor
      context.strokeStyle = axisColor
      context.beginPath()
      context.lineWidth = 1
      context.moveTo(w, 0)
      context.lineTo(w, h)
      context.stroke()
      context.beginPath()
      context.moveTo(0, h)
      context.lineTo(w, h)
      context.stroke()
      context.setLineDash([2])
      context.beginPath()
      context.moveTo(w / 2, 0)
      context.lineTo(w / 2, h)
      context.stroke()
      context.setLineDash([])

      const sortedList = tempList.sort((a, b) => a.x - b.x)
      sortedList.forEach((item, index) => {
        const key = `${item.x},${item.y},${item.side}`
        const opposite =
          item.side !== sortedList[sortedList.length - index - 1]?.side
            ? sortedList[sortedList.length - index - 1]
            : ({} as TempChartDataItem)
        valueMap.current.set(key, { currentValue: item.value, oppositeValue: opposite })
      })
    },
    [colors],
  )

  const initChart = useCallback(() => {
    const chartData = chartDataRef.current
    if (!chartRef.current || !chartMaskRef.current || !chartXRef.current || !chartYRef.current)
      return

    const context = chartRef.current.getContext('2d')
    const maskContext = chartMaskRef.current.getContext('2d')
    const xContext = chartXRef.current.getContext('2d')
    const yContext = chartYRef.current.getContext('2d')
    if (!context || !maskContext || !xContext || !yContext) return

    chartRef.current.width = drawWidth
    chartRef.current.height = drawHeight
    chartMaskRef.current.width = drawWidth
    chartMaskRef.current.height = drawHeight
    chartXRef.current.width = drawWidth
    chartXRef.current.height = X_AXIS_HEIGHT
    chartYRef.current.width = Y_AXIS_WIDTH
    chartYRef.current.height = drawHeight

    resolveDevicePixelRatioScale(chartRef.current, context)
    resolveDevicePixelRatioScale(chartMaskRef.current, maskContext)
    resolveDevicePixelRatioScale(chartXRef.current, xContext)
    resolveDevicePixelRatioScale(chartYRef.current, yContext)

    const maxAmount = Math.max(
      parseFloat(chartData.sell?.[0]?.total ?? '0'),
      parseFloat(chartData.buy?.[chartData.buy.length - 1]?.total ?? '0'),
    )
    const scaleW = drawWidth / 2 / Math.max(chartData.sell?.length ?? 1, chartData.buy?.length ?? 1)
    const publicData = { maxAmount, scaleW, w: drawWidth, h: drawHeight }

    valueMap.current.clear()
    drawDepthChart(context, chartData, publicData)

    xContext.fillStyle = '#70798C'
    xContext.textAlign = 'center'
    const yHeight = 20
    const displayPrice = lastPrice
      ? thousandsSeparator(formatContinuousDecimal(lastPrice, pricePrecision))
      : '--'
    xContext.fillText(displayPrice, drawWidth / 2, yHeight)

    if (chartData.buy?.length) {
      const buyData = chartData.buy
      const buyMiddleData = buyData.length > 2 ? buyData[Math.floor(buyData.length / 2)] : null
      const buyLeftData = buyData[0]
      xContext.textAlign = 'left'
      if (buyMiddleData?.price)
        xContext.fillText(
          generateFormatValue(buyMiddleData.price),
          drawWidth / 2 - (buyData.length / 2) * scaleW,
          yHeight,
        )
      if (buyLeftData?.price) xContext.fillText(generateFormatValue(buyLeftData.price), 0, yHeight)
    }

    if (chartData.sell?.length) {
      const sellData = chartData.sell
      const sellMiddleData = sellData.length > 2 ? sellData[Math.floor(sellData.length / 2)] : null
      const sellRightData = sellData[sellData.length - 1]
      xContext.textAlign = 'right'
      if (sellMiddleData?.price)
        xContext.fillText(
          generateFormatValue(sellMiddleData.price),
          drawWidth / 2 + (sellData.length / 2) * scaleW,
          yHeight,
        )
      if (sellRightData?.price)
        xContext.fillText(
          generateFormatValue(sellRightData.price),
          drawWidth / 2 + sellData.length * scaleW,
          yHeight,
        )
    }

    yContext.fillStyle = '#70798C'
    const seg = maxAmount / 5
    for (let i = 1; i < 6; i++) {
      const y = drawHeight - ((seg * i) / maxAmount) * drawHeight
      yContext.fillText(formatNumber(seg * i, { decimals: amountPrecision, showUnit: true }), 12, y)
    }
  }, [
    drawWidth,
    drawHeight,
    drawDepthChart,
    lastPrice,
    pricePrecision,
    amountPrecision,
    generateFormatValue,
  ])

  const TOOLTIP_WIDTH = 110
  const TOOLTIP_HEIGHT = 52

  const onMouseMove = useCallback(
    (offsetX: number) => {
      const maskContext = chartMaskRef.current?.getContext('2d')
      if (!maskContext) return
      maskContext.clearRect(0, 0, drawWidth, drawHeight)
      lastMoveOffsetX.current = String(offsetX)

      const buyColor = colors.buyColor ?? DEFAULT_DEPTH_CHART_COLORS.buyColor
      const sellColor = colors.sellColor ?? DEFAULT_DEPTH_CHART_COLORS.sellColor

      const keys = Array.from(valueMap.current.keys())
      let buyItem: TempChartDataItem | null = null
      let sellItem: TempChartDataItem | null = null

      for (const key of keys) {
        const parts = key.split(',')
        const xStr = parts[0]
        const yStr = parts[1]
        const side = parts[2]
        const x = Number(xStr)
        const mapData = valueMap.current.get(key)
        if (!mapData || offsetX >= x) continue

        const item = { x, y: Number(yStr ?? 0), value: mapData.currentValue, side }
        if (side === 'buy') buyItem = item
        else sellItem = item
        const opp = mapData.oppositeValue
        if (opp?.x != null && opp?.value) {
          const oppItem = { x: opp.x, y: opp.y, value: opp.value, side: opp.side }
          if (opp.side === 'buy') buyItem = oppItem
          else sellItem = oppItem
        }
        break
      }

      const blockColor = 'rgba(132, 142, 156, 0.05)'
      maskContext.fillStyle = blockColor
      maskContext.setLineDash([2])

      if (buyItem) {
        maskContext.fillRect(0, 0, buyItem.x, drawHeight)
        maskContext.beginPath()
        maskContext.strokeStyle = buyColor
        maskContext.moveTo(buyItem.x, 0)
        maskContext.lineTo(buyItem.x, drawHeight)
        maskContext.stroke()
        maskContext.beginPath()
        maskContext.fillStyle = buyColor
        maskContext.arc(buyItem.x, buyItem.y, 4, 0, 2 * Math.PI)
        maskContext.fill()
      }

      if (sellItem) {
        maskContext.fillStyle = blockColor
        maskContext.fillRect(sellItem.x, 0, drawWidth - sellItem.x, drawHeight)
        maskContext.beginPath()
        maskContext.strokeStyle = sellColor
        maskContext.moveTo(sellItem.x, 0)
        maskContext.lineTo(sellItem.x, drawHeight)
        maskContext.stroke()
        maskContext.beginPath()
        maskContext.fillStyle = sellColor
        maskContext.arc(sellItem.x, sellItem.y, 4, 0, 2 * Math.PI)
        maskContext.fill()
      }

      maskContext.setLineDash([])
      setHoverData({ buyItem, sellItem })
    },
    [drawWidth, drawHeight, colors],
  )

  const onMouseOut = useCallback(() => {
    lastMoveOffsetX.current = ''
    setHoverData(null)
    const maskContext = chartMaskRef.current?.getContext('2d')
    if (maskContext) maskContext.clearRect(0, 0, drawWidth, drawHeight)
  }, [drawWidth, drawHeight])

  useEffect(() => {
    chartDataRef.current = data
    initChart()
    if (lastMoveOffsetX.current) onMouseMove(Number(lastMoveOffsetX.current))
  }, [data, initChart, onMouseMove])

  const handleResize = useCallback(() => {
    initChart()
    if (lastMoveOffsetX.current) onMouseMove(Number(lastMoveOffsetX.current))
  }, [initChart, onMouseMove])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(handleResize, 300)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      clearTimeout(timer)
    }
  }, [handleResize])

  const tooltipBg = colors.tooltipBgColor ?? DEFAULT_DEPTH_CHART_COLORS.tooltipBgColor
  const tooltipText = colors.tooltipTextColor ?? DEFAULT_DEPTH_CHART_COLORS.tooltipTextColor
  const buyColor = colors.buyColor ?? DEFAULT_DEPTH_CHART_COLORS.buyColor
  const sellColor = colors.sellColor ?? DEFAULT_DEPTH_CHART_COLORS.sellColor

  const renderTooltipContent = (item: TempChartDataItem) => {
    const priceRange = getPriceRangeData(parseFloat(item.value.price))
    const left = getTipsLeft(item.x, drawWidth, TOOLTIP_WIDTH, item.side)
    let top = item.y - TOOLTIP_HEIGHT - 10
    if (top <= 0) top = item.y + 10

    const tooltipItem: DepthChartTooltipItem = {
      ...item,
      side: item.side as 'buy' | 'sell',
      priceRange,
    }

    if (renderTooltipProp) {
      return renderTooltipProp(tooltipItem, { left, top })
    }

    const isBuy = item.side === 'buy'
    return (
      <div
        key={item.side}
        className="pointer-events-none absolute z-10 rounded-[6px] p-[8px]"
        style={{
          left,
          top,
          width: TOOLTIP_WIDTH,
          backgroundColor: tooltipBg,
          color: tooltipText,
        }}
      >
        <div className="flex flex-col gap-[8px] text-[12px]">
          <div className="flex items-center justify-between gap-2">
            <span>{t`Range`}</span>
            <span style={{ color: isBuy ? buyColor : sellColor }}>{priceRange}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>{t`Price`}</span>
            <span className="font-medium">
              {formatNumber(item.value.price, { showUnit: false, decimals: pricePrecision })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span>{t`Amount`}</span>
            <span className="font-medium">
              {formatNumber(item.value.total, { showUnit: true, decimals: amountPrecision })}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width, height }}>
      <canvas ref={chartRef} style={{ position: 'absolute', top: 0, left: 0 }} />
      <canvas
        ref={chartMaskRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
        onMouseMove={(e) => onMouseMove(e.nativeEvent.offsetX)}
        onMouseOut={onMouseOut}
      />
      <canvas ref={chartXRef} style={{ position: 'absolute', left: 0, bottom: 0 }} />
      <canvas ref={chartYRef} style={{ position: 'absolute', top: 0, right: 0 }} />
      {hoverData && (
        <div className="pointer-events-none absolute inset-0" style={{ zIndex: 10 }}>
          {hoverData.buyItem && renderTooltipContent(hoverData.buyItem)}
          {hoverData.sellItem && renderTooltipContent(hoverData.sellItem)}
        </div>
      )}
    </div>
  )
}
