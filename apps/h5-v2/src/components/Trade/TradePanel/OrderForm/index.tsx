import { PositionActionEnum } from '../../type'
import { useTradePanelStore } from '../store'
import { AmountInput } from './AmountInput'
import { MarginAmountInput } from './MarginAmount'
import { PriceInput } from './PriceInput'

export const OrderForm = () => {
  const { autoMarginMode, positionAction } = useTradePanelStore()
  return (
    <div className="mt-[8px]">
      {!autoMarginMode && positionAction === PositionActionEnum.OPEN && <MarginAmountInput />}
      <PriceInput />
      <AmountInput />
    </div>
  )
}
