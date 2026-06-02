import { Direction, OperationType, OrderStatus, OrderType } from '@myx-trade/sdk'
import { t } from '@lingui/core/macro'
import { displayAmount, formatNumber } from '@/utils/number'
import type { ActionToastParts } from './action-toast'

type PoolLike = { baseSymbol?: string; quoteSymbol?: string } | undefined

export function getOrderToastParts(
  orderInfo: Record<string, any>,
  pool: PoolLike,
): Omit<ActionToastParts, never> | null {
  const status = orderInfo.status as number
  const baseSym = pool?.baseSymbol ?? orderInfo.baseSymbol ?? ''
  const quoteSym = pool?.quoteSymbol ?? orderInfo.quoteSymbol ?? ''
  const pairLabel = `${baseSym}${quoteSym}` || '--'

  const orderTypeLabel =
    orderInfo.orderType === OrderType.MARKET
      ? t`Market`
      : orderInfo.orderType === OrderType.LIMIT
        ? t`Limit`
        : orderInfo.orderType === OrderType.STOP
          ? t`Stop`
          : t`Order`

  if (status === OrderStatus.PARTIAL) {
    const headlineEn = `${pairLabel} ${orderTypeLabel} ${t`Order Partially Filled`}`
    const { detailEmphasis, detailRest, variant } = buildDetailSections(orderInfo, pool, true)
    return { title: t`订单成交`, headlineEn, detailEmphasis, detailRest, variant }
  }

  if (status === OrderStatus.FILLED) {
    const headlineEn = `${pairLabel} ${orderTypeLabel} ${t`Order Filled`}`
    const { detailEmphasis, detailRest, variant } = buildDetailSections(orderInfo, pool, true)
    return { title: t`订单成交`, headlineEn, detailEmphasis, detailRest, variant }
  }

  if (status === OrderStatus.CANCELLED) {
    const headlineEn = `${pairLabel} ${orderTypeLabel} ${t`Order Cancelled`}`
    return {
      title: t`订单取消`,
      headlineEn,
      detailEmphasis: '',
      detailRest: '',
      variant: 'buy' as const,
    }
  }

  return null
}

function buildDetailSections(
  orderInfo: Record<string, any>,
  pool: PoolLike,
  preferFilledSize: boolean,
): { detailEmphasis: string; detailRest: string; variant: 'buy' | 'sell' } {
  const baseSym = pool?.baseSymbol ?? orderInfo.baseSymbol ?? ''
  const direct = orderInfo.direct ?? orderInfo.direction
  const operation = orderInfo.operation

  const sizeRaw = preferFilledSize
    ? (orderInfo.filledSize ?? orderInfo.cumSize ?? orderInfo.size ?? '0')
    : (orderInfo.size ?? '0')

  const sizeStr = formatNumber(String(sizeRaw), { showUnit: false })
  const priceSrc = String(orderInfo.lastPrice ?? orderInfo.price ?? '0')
  const priceStr = displayAmount(priceSrc)

  if (direct == null || operation == null) {
    return {
      detailEmphasis: '',
      detailRest: `${sizeStr} ${baseSym} ${t`at`} ${priceStr}`,
      variant: 'buy',
    }
  }

  const isDecreaseOrder = operation === OperationType.DECREASE
  // 开多(INCREASE+LONG) 或 平空(DECREASE+SHORT) → Buy
  const isBuy =
    (!isDecreaseOrder && direct === Direction.LONG) ||
    (isDecreaseOrder && direct === Direction.SHORT)
  const dirLabel = isBuy ? t`Buy` : t`Sell`

  return {
    detailEmphasis: `${dirLabel} ${sizeStr}`,
    detailRest: ` ${baseSym} ${t`at`} ${priceStr}`,
    variant: isBuy ? 'buy' : 'sell',
  }
}
