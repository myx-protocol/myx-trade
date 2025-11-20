import { OrderSide } from './OrderSide'
import { useCookOrderStore } from '@/components/CookDetail/Order/store.ts'
import { CookOrderSideEnum } from '@/components/CookDetail/Order/type.ts'
import { Buy } from '@/components/CookDetail/Order/Buy.tsx'
import { Sell } from './Sell'
import { OrderTips } from '@/components/CookDetail/Order/OrderTips'

export const Order = () => {
  const { orderSide } = useCookOrderStore()
  if (orderSide === CookOrderSideEnum.Buy) {
    return (
      <div className="p-[20px] leading-[1]">
        <OrderSide />
        <Buy />
        <OrderTips />
      </div>
    )
  }

  if (orderSide === CookOrderSideEnum.Sell) {
    return (
      <div className="p-[20px] leading-[1]">
        <OrderSide />
        <Sell />
        <OrderTips />
      </div>
    )
  }

  return <></>
}
