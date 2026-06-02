import { DirectionEnum, type Direction } from '@myx-trade/sdk'
import { parseBigNumber } from './bn'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

/** 触发价须在爆仓价与自动止盈价之间（不含端点）；无 Auto-TP 时仅校验相对爆仓价的一侧。爆仓价无法计算时不拦截。 */
export const verifyTpSlTriggerLiqAutoTpBounds = (
  triggerHuman: string,
  liqHuman: string,
  autoTpHuman: string,
  direction: Direction,
): boolean => {
  const T = parseBigNumber(triggerHuman)
  if (T.eq(0)) {
    return true
  }

  const L = parseBigNumber(liqHuman)
  const A = parseBigNumber(autoTpHuman ?? '0')

  if (L.eq(0)) {
    return true
  }

  const msg = t`Trigger price must be between Liquidation and Auto-TP prices.`

  if (A.eq(0)) {
    if (direction === DirectionEnum.Long) {
      if (T.lte(L)) {
        toast.error({ title: msg })
        return false
      }
    } else {
      if (T.gte(L)) {
        toast.error({ title: msg })
        return false
      }
    }
    return true
  }

  const low = L.lt(A) ? L : A
  const high = L.lt(A) ? A : L

  if (T.lte(low) || T.gte(high)) {
    toast.error({ title: msg })
    return false
  }

  return true
}

export const verifyTpSlPrice = (
  entryPrice: string,
  triggerPrice: string,
  direction: Direction,
  type: 'tp' | 'sl',
  referenceLabel: 'entry' | 'current' = 'entry',
) => {
  if (direction === DirectionEnum.Long) {
    if (type === 'tp') {
      if (parseBigNumber(entryPrice).gt(parseBigNumber(triggerPrice))) {
        toast.error({
          title:
            referenceLabel === 'current'
              ? t`TP price must be greater than current price`
              : t`TP price must be greater than entry price`,
        })

        return false
      }
    } else {
      if (parseBigNumber(entryPrice).lt(parseBigNumber(triggerPrice))) {
        toast.error({
          title:
            referenceLabel === 'current'
              ? t`SL price must be less than current price`
              : t`SL price must be less than entry price`,
        })

        return false
      }
    }
  } else {
    if (type === 'tp') {
      if (parseBigNumber(entryPrice).lt(parseBigNumber(triggerPrice))) {
        toast.error({
          title:
            referenceLabel === 'current'
              ? t`TP price must be less than current price`
              : t`TP price must be less than entry price`,
        })

        return false
      }
    } else {
      if (parseBigNumber(entryPrice).gt(parseBigNumber(triggerPrice))) {
        toast.error({
          title:
            referenceLabel === 'current'
              ? t`SL price must be greater than current price`
              : t`SL price must be greater than entry price`,
        })

        return false
      }
    }
  }

  return true
}
