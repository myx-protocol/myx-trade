import { DirectionEnum, type Direction } from '@myx-trade/sdk'
import { parseBigNumber } from './bn'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'

export const verifyTpSlPrice = (
  entryPrice: string,
  triggerPrice: string,
  direction: Direction,
  type: 'tp' | 'sl',
) => {
  if (direction === DirectionEnum.Long) {
    if (type === 'tp') {
      if (parseBigNumber(entryPrice).gt(parseBigNumber(triggerPrice))) {
        toast.error({
          title: t`TP price must be greater than entry price`,
        })

        return false
      }
    } else {
      if (parseBigNumber(entryPrice).lt(parseBigNumber(triggerPrice))) {
        toast.error({
          title: t`SL price must be less than entry price`,
        })

        return false
      }
    }
  } else {
    if (type === 'tp') {
      if (parseBigNumber(entryPrice).lt(parseBigNumber(triggerPrice))) {
        toast.error({
          title: t`TP price must be less than entry price`,
        })

        return false
      }
    } else {
      if (parseBigNumber(entryPrice).gt(parseBigNumber(triggerPrice))) {
        toast.error({
          title: t`SL price must be greater than entry price`,
        })

        return false
      }
    }
  }

  return true
}
