import { useCookOrderStore } from '../store'
import { CookOrderSideEnum } from '../type'
import { Input } from './Input'
import { Output } from './Output'
import { Profit } from './Profit'

export const OrderForm = () => {
  const { orderSide } = useCookOrderStore()
  return (
    <div className="mt-[12px]">
      <Input />
      <Output />
      {orderSide === CookOrderSideEnum.Sell && <Profit />}
    </div>
  )
}
