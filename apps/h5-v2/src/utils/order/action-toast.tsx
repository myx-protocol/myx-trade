import clsx from 'clsx'
import type { ReactNode } from 'react'
import { Direction, OrderType } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { displayAmount, formatNumber } from '@/utils/number'

export type ActionToastParts = {
  title: string
  headlineEn: string
  detailEmphasis: string
  detailRest: string
}

export function renderOrderToastContent(
  parts: Omit<ActionToastParts, 'title'>,
  variant: 'success' | 'error' = 'success',
): ReactNode {
  return (
    <div className="flex flex-col gap-[6px]">
      <div className="text-[12px] leading-[1.35] font-medium text-[#9DA3AE]">
        {parts.headlineEn}
      </div>
      <div className="text-[13px] leading-[1.35]">
        <span className={clsx(variant === 'success' ? 'text-[#00E3A5]' : 'text-[#EC605A]')}>
          {parts.detailEmphasis}
        </span>
        <span className="text-[#9DA3AE]">{parts.detailRest}</span>
      </div>
    </div>
  )
}

function dirLabel(direction: Direction, isIncrease: boolean): string {
  if (isIncrease) {
    return direction === Direction.LONG ? 'Buy' : 'Sell'
  }
  return direction === Direction.LONG ? 'Sell' : 'Buy'
}

function orderTypeLabel(orderType: OrderType): string {
  if (orderType === OrderType.LIMIT) return 'Limit'
  if (orderType === OrderType.STOP) return 'Stop'
  return 'Market'
}

export function buildSubmitOrderToastParts({
  isIncrease,
  direction,
  size,
  price,
  orderType,
  baseSymbol,
  quoteSymbol,
}: {
  isIncrease: boolean
  direction: Direction
  size: string
  price: string
  orderType: OrderType
  baseSymbol: string
  quoteSymbol: string
}): ActionToastParts {
  const pair = `${baseSymbol}${quoteSymbol}`
  const typeLabel = orderTypeLabel(orderType)
  const sizeStr = formatNumber(String(size), { showUnit: false })
  const priceStr = orderType === OrderType.MARKET ? 'Market' : displayAmount(price)
  return {
    title: t`订单提交成功`,
    headlineEn: `${pair} ${typeLabel} Order Submitted`,
    detailEmphasis: `${dirLabel(direction, isIncrease)} ${sizeStr}`,
    detailRest: ` ${baseSymbol} at ${priceStr}`,
  }
}

export function buildCancelOrderToastParts({
  isIncrease,
  direction,
  size,
  price,
  orderType,
  baseSymbol,
  quoteSymbol,
}: {
  isIncrease: boolean
  direction: Direction
  size: string
  price: string
  orderType: OrderType
  baseSymbol: string
  quoteSymbol: string
}): ActionToastParts {
  const pair = `${baseSymbol}${quoteSymbol}`
  const typeLabel = orderTypeLabel(orderType)
  const sizeStr = formatNumber(String(size), { showUnit: false })
  const priceStr = orderType === OrderType.MARKET ? 'Market' : displayAmount(price)
  return {
    title: t`订单取消`,
    headlineEn: `${pair} ${typeLabel} Order Cancelled`,
    detailEmphasis: `${dirLabel(direction, isIncrease)} ${sizeStr}`,
    detailRest: ` ${baseSymbol} at ${priceStr}`,
  }
}

export function buildClosePositionToastParts({
  direction,
  size,
  price,
  orderType,
  baseSymbol,
  quoteSymbol,
}: {
  direction: Direction
  size: string
  price: string
  orderType: OrderType
  baseSymbol: string
  quoteSymbol: string
}): ActionToastParts {
  const pair = `${baseSymbol}${quoteSymbol}`
  const typeLabel = orderTypeLabel(orderType)
  const sizeStr = formatNumber(String(size), { showUnit: false })
  const priceStr = orderType === OrderType.MARKET ? 'Market' : displayAmount(price)
  return {
    title: t`订单提交成功`,
    headlineEn: `${pair} ${typeLabel} Order Submitted`,
    // DECREASE: LONG closes by Selling, SHORT by Buying
    detailEmphasis: `${dirLabel(direction, false)} ${sizeStr}`,
    detailRest: ` ${baseSymbol} at ${priceStr}`,
  }
}

export function buildAdjustMarginToastParts({
  adjustType,
  amount,
  baseSymbol,
  quoteSymbol,
}: {
  adjustType: 'increase' | 'decrease'
  amount: string
  baseSymbol: string
  quoteSymbol: string
}): ActionToastParts {
  const pair = `${baseSymbol}${quoteSymbol}`
  const actionLabel = adjustType === 'increase' ? 'Increased' : 'Decreased'
  const sign = adjustType === 'increase' ? '+' : '-'
  const amountStr = formatNumber(String(amount), { showUnit: false })
  return {
    title: t`调整保证金成功`,
    headlineEn: `${pair} Margin ${actionLabel}`,
    detailEmphasis: `${sign}${amountStr}`,
    detailRest: ` ${quoteSymbol}`,
  }
}

export function buildTpSlToastParts({
  direction,
  size,
  baseSymbol,
  quoteSymbol,
}: {
  direction: Direction
  size: string
  baseSymbol: string
  quoteSymbol: string
}): ActionToastParts {
  const pair = `${baseSymbol}${quoteSymbol}`
  const sizeStr = formatNumber(String(size), { showUnit: false })
  return {
    title: t`止盈止损更新成功`,
    headlineEn: `${pair} TP/SL Order Submitted`,
    // TP/SL is DECREASE: LONG → Sell, SHORT → Buy
    detailEmphasis: `${dirLabel(direction, false)} ${sizeStr}`,
    detailRest: ` ${baseSymbol}`,
  }
}
