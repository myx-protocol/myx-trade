import { useTradePanelStore } from '../store'
import { AmountInput } from './AmountInput'
import { MarginAmountInput } from './MarginAmount'
import { PriceInput } from './PriceInput'

export const OrderForm = () => {
  const { autoMarginMode } = useTradePanelStore()
  return (
    <div className="mt-[8px]">
      {!autoMarginMode && <MarginAmountInput />}
      <PriceInput />
      <AmountInput />
    </div>
  )
}
