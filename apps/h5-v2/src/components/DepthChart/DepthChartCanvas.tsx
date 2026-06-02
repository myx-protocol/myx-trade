/**
 * 深度图 Canvas 绘制组件
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import type { DepthChartDataItem } from './types'
import { DEFAULT_DEPTH_CHART_COLORS, thousandsSeparator, formatContinuousDecimal } from './utils'
import type { DepthChartColors, DepthChartTooltipItem } from './types'
import { decimalToPercent, formatNumber } from '@/utils/number'
import { t } from '@lingui/core/macro'
import Big from 'big.js'

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
  pricePrecision?: number
  amountPrecision?: number
  width: number
  height: number
  renderTooltip?: (
    item: DepthChartTooltipItem,
    position: { left: number; top: number },
  ) => React.ReactNode
  baseSymbol?: string
  quoteSymbol?: string
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
  baseSymbol,
  quoteSymbol,
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
  const drawnDataRef = useRef<{ buy: TempChartDataItem[]; sell: TempChartDataItem[] }>({
    buy: [],
    sell: [],
  })
  const [hoverData, setHoverData] = useState<{
    buyItem: TempChartDataItem | null
    sellItem: TempChartDataItem | null
  } | null>(null)

  const zoomLevelRef = useRef(1)
  const isDrawingRef = useRef(false)

  const drawWidth = width - Y_AXIS_WIDTH
  const drawHeight = height - X_AXIS_HEIGHT

  const generateFormatValue = useCallback(
    (value: string | number) =>
      formatNumber(String(value), { decimals: pricePrecision, showUnit: false }),
    [pricePrecision],
  )

  const getPriceRangeData = useCallback(
    (price: number): string => {
      if (!lastPrice || !Number(lastPrice)) return '--'
      const calcPrice = (price - Number(lastPrice)) / Number(lastPrice)
      if (!isFinite(calcPrice)) return '--'
      return decimalToPercent(calcPrice, {
        showSign: true,
        decimals: pricePrecision || 2,
      })
    },
    [lastPrice, pricePrecision],
  )

  const drawDepthChart = useCallback(
    (
      context: CanvasRenderingContext2D,
      chartData: { buy: DepthChartDataItem[]; sell: DepthChartDataItem[] },
      publicData: {
        maxAmount: number
        buyPriceDiff: number
        sellPriceDiff: number
        centerPrice: number
        w: number
        h: number
      },
    ) => {
      const tempList: TempChartDataItem[] = []
      const { maxAmount, buyPriceDiff, sellPriceDiff, centerPrice, w, h } = publicData
      const buyColor = colors.buyColor ?? DEFAULT_DEPTH_CHART_COLORS.buyColor
      const sellColor = colors.sellColor ?? DEFAULT_DEPTH_CHART_COLORS.sellColor
      const buyOpacity = colors.buyOpacityColor ?? DEFAULT_DEPTH_CHART_COLORS.buyOpacityColor
      const sellOpacity = colors.sellOpacityColor ?? DEFAULT_DEPTH_CHART_COLORS.sellOpacityColor

      context.beginPath()
      if (chartData.buy?.length) {
        context.beginPath()
        let prevY = 0
        for (const i in chartData.buy) {
          const item = chartData.buy[i]
          const total = parseFloat(item.total)
          let y = h - (total / maxAmount) * h + PADDING_TOP
          if (y > h - PADDING_TOP) y = h - PADDING_TOP
          const itemPrice = parseFloat(item.price)
          const x = w / 2 - ((centerPrice - itemPrice) / buyPriceDiff) * (w / 2 - GAP) - GAP
          tempList.push({ x, y, value: item, side: 'buy' })
          if (Number(i) === 0) {
            context.moveTo(x, y)
          } else {
            context.lineTo(x, prevY)
            context.lineTo(x, y)
          }
          prevY = y
        }
        const lastBuy = tempList[tempList.length - 1]
        const lastX = lastBuy?.x ?? 0
        const lastY = lastBuy?.y ?? h
        if (lastX > 0) {
          context.lineTo(0, lastY)
        }
        context.strokeStyle = buyColor
        context.lineWidth = 1
        context.stroke()
        context.lineTo(Math.min(0, lastX), h)
        context.lineTo(w / 2 - GAP, h)
        context.fillStyle = buyOpacity
        context.fill()
        context.closePath()
      }

      if (chartData.sell?.length) {
        context.beginPath()
        let isFirst = true
        let prevY = 0
        for (const i in chartData.sell) {
          const index = chartData.sell.length - Number(i) - 1
          const item = chartData.sell[index]
          if (!item) continue
          const total = parseFloat(item.total ?? '0')

          let y = h - (total / maxAmount) * h + PADDING_TOP
          if (y > h - PADDING_TOP) y = h - PADDING_TOP
          const itemPrice = parseFloat(item.price)
          const x = w / 2 + ((itemPrice - centerPrice) / sellPriceDiff) * (w / 2 - GAP) + GAP
          tempList.push({ x, y, value: item, side: 'sell' })
          if (isFirst) {
            context.moveTo(x, y)
            isFirst = false
          } else {
            context.lineTo(x, prevY)
            context.lineTo(x, y)
          }
          prevY = y
        }
        const lastSell = tempList.filter((t) => t.side === 'sell').pop()
        const lastX = lastSell?.x ?? w
        const lastY = lastSell?.y ?? h
        if (lastX < w + GAP) {
          context.lineTo(w + GAP, lastY)
        }
        context.strokeStyle = sellColor
        context.lineWidth = 1
        context.stroke()
        context.lineTo(Math.max(w + GAP, lastX), h)
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

      drawnDataRef.current = {
        buy: tempList.filter((t) => t.side === 'buy'),
        sell: tempList.filter((t) => t.side === 'sell'),
      }
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

    const globalMaxAmount = Math.max(
      parseFloat(chartData.sell?.[0]?.total ?? '0'),
      parseFloat(chartData.buy?.[chartData.buy.length - 1]?.total ?? '0'),
    )
    const centerPrice = Number(lastPrice || '0')
    const minBuyPrice = parseFloat(
      chartData.buy?.[chartData.buy.length - 1]?.price ?? String(centerPrice),
    )
    const maxSellPrice = parseFloat(chartData.sell?.[0]?.price ?? String(centerPrice))

    let baseBuyPriceDiff = Math.abs(centerPrice - minBuyPrice)
    if (baseBuyPriceDiff === 0) baseBuyPriceDiff = 1

    let baseSellPriceDiff = Math.abs(maxSellPrice - centerPrice)
    if (baseSellPriceDiff === 0) baseSellPriceDiff = 1

    const zoomLevel = zoomLevelRef.current
    const buyPriceDiff = baseBuyPriceDiff / zoomLevel
    const sellPriceDiff = baseSellPriceDiff / zoomLevel

    let maxAmount = 0
    const visibleBuyData = chartData.buy?.filter(
      (item) => parseFloat(item.price) >= centerPrice - buyPriceDiff,
    )
    if (visibleBuyData?.length) {
      maxAmount = Math.max(maxAmount, parseFloat(visibleBuyData[visibleBuyData.length - 1].total))
    }
    const visibleSellData = chartData.sell?.filter(
      (item) => parseFloat(item.price) <= centerPrice + sellPriceDiff,
    )
    if (visibleSellData?.length) {
      maxAmount = Math.max(maxAmount, parseFloat(visibleSellData[0].total))
    }
    if (maxAmount === 0) maxAmount = globalMaxAmount

    const publicData = {
      maxAmount,
      buyPriceDiff,
      sellPriceDiff,
      centerPrice,
      w: drawWidth,
      h: drawHeight,
    }

    drawDepthChart(context, chartData, publicData)

    xContext.fillStyle = '#70798C'
    xContext.textAlign = 'center'
    const yHeight = 20
    const displayPrice = lastPrice
      ? formatNumber(lastPrice, { decimals: pricePrecision, showUnit: false })
      : formatNumber('0', { decimals: pricePrecision, showUnit: false })
    xContext.fillText(displayPrice, drawWidth / 2, yHeight)

    const centerX = drawWidth / 2
    const getBuyX = (p: number) =>
      drawWidth / 2 - ((centerPrice - p) / buyPriceDiff) * (drawWidth / 2 - GAP) - GAP
    const getSellX = (p: number) =>
      drawWidth / 2 + ((p - centerPrice) / sellPriceDiff) * (drawWidth / 2 - GAP) + GAP

    if (chartData.buy?.length) {
      const b1 = centerPrice - buyPriceDiff * 0.333
      const b2 = centerPrice - buyPriceDiff * 0.666
      const b3 = centerPrice - buyPriceDiff

      const x1 = getBuyX(b1)
      const x2 = getBuyX(b2)
      const x3 = getBuyX(b3)

      if (centerX - x1 > 40) {
        xContext.textAlign = 'center'
        xContext.fillText(generateFormatValue(b1), x1, yHeight)
      }
      if (x1 - x2 > 40) {
        xContext.textAlign = 'center'
        xContext.fillText(generateFormatValue(b2), x2, yHeight)
      }
      if (x2 - x3 > 40) {
        xContext.textAlign = 'left'
        xContext.fillText(generateFormatValue(b3), Math.max(0, x3), yHeight)
      }
    }

    if (chartData.sell?.length) {
      const s1 = centerPrice + sellPriceDiff * 0.333
      const s2 = centerPrice + sellPriceDiff * 0.666
      const s3 = centerPrice + sellPriceDiff

      const x1 = getSellX(s1)
      const x2 = getSellX(s2)
      const x3 = getSellX(s3)

      if (x1 - centerX > 40) {
        xContext.textAlign = 'center'
        xContext.fillText(generateFormatValue(s1), x1, yHeight)
      }
      if (x2 - x1 > 40) {
        xContext.textAlign = 'center'
        xContext.fillText(generateFormatValue(s2), x2, yHeight)
      }
      if (x3 - x2 > 40) {
        xContext.textAlign = 'right'
        xContext.fillText(generateFormatValue(s3), Math.min(drawWidth, x3), yHeight)
      }
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

  useEffect(() => {
    const canvas = chartMaskRef.current
    if (!canvas) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      let newZoom = zoomLevelRef.current - e.deltaY * 0.002
      newZoom = Math.max(1, Math.min(50, newZoom))
      zoomLevelRef.current = newZoom

      if (!isDrawingRef.current) {
        isDrawingRef.current = true
        requestAnimationFrame(() => {
          initChart()
          if (lastMoveOffsetX.current) {
            onMouseMove(Number(lastMoveOffsetX.current))
          }
          isDrawingRef.current = false
        })
      }
    }
    canvas.addEventListener('wheel', onWheel, { passive: false })
    return () => canvas.removeEventListener('wheel', onWheel)
  }, [initChart])

  const TOOLTIP_WIDTH = 170
  const TOOLTIP_HEIGHT = 52

  const onMouseMove = useCallback(
    (offsetX: number) => {
      const maskContext = chartMaskRef.current?.getContext('2d')
      if (!maskContext) return
      maskContext.clearRect(0, 0, drawWidth, drawHeight)
      lastMoveOffsetX.current = String(offsetX)

      const buyColor = colors.buyColor ?? DEFAULT_DEPTH_CHART_COLORS.buyColor
      const sellColor = colors.sellColor ?? DEFAULT_DEPTH_CHART_COLORS.sellColor

      const { buy, sell } = drawnDataRef.current
      if (!buy.length && !sell.length) return

      let buyItem: TempChartDataItem | null = null
      let sellItem: TempChartDataItem | null = null
      const centerX = drawWidth / 2

      if (offsetX <= centerX) {
        let matchIdx = -1
        for (let i = 0; i < buy.length; i++) {
          if (buy[i].x < offsetX) {
            matchIdx = i === 0 ? 0 : i - 1
            break
          }
        }
        if (matchIdx === -1 && buy.length > 0) matchIdx = buy.length - 1

        if (matchIdx !== -1) {
          buyItem = { ...buy[matchIdx], x: offsetX }
          if (sell.length > 0) {
            const sIdx = Math.min(matchIdx, sell.length - 1)
            sellItem = { ...sell[sIdx], x: centerX + (centerX - offsetX) }
          }
        }
      } else {
        let matchIdx = -1
        for (let i = 0; i < sell.length; i++) {
          if (sell[i].x > offsetX) {
            matchIdx = i === 0 ? 0 : i - 1
            break
          }
        }
        if (matchIdx === -1 && sell.length > 0) matchIdx = sell.length - 1

        if (matchIdx !== -1) {
          sellItem = { ...sell[matchIdx], x: offsetX }
          if (buy.length > 0) {
            const bIdx = Math.min(matchIdx, buy.length - 1)
            buyItem = { ...buy[bIdx], x: centerX - (offsetX - centerX) }
          }
        }
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
            <p className="tet-ellipsis max-w-[100px] whitespace-nowrap">
              {t`Amount`}
              {baseSymbol ? `(${baseSymbol})` : ''}
            </p>
            <span className="font-medium">
              {formatNumber(item.value.total, { showUnit: true, decimals: amountPrecision })}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="tet-ellipsis max-w-[100px] whitespace-nowrap">
              {t`Amount`}
              {quoteSymbol ? `(${quoteSymbol})` : ''}
            </p>
            <span className="font-medium">
              {formatNumber(Big(item.value.total).mul(parseFloat(lastPrice || '0')), {
                showUnit: true,
                decimals: pricePrecision,
              })}
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
