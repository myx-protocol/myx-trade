import Big from 'big.js'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'

/* (当前价-持仓均价) *持仓数量*/
export const calculationPnl = (price: string, avgPrice: string, lastTotal: string) => {
  if (!price || !avgPrice || !lastTotal) return ''
  const _price = new Big(price)
  const quantity = new Big(lastTotal)
  const _avgPrice = new Big(avgPrice)
  return _price.sub(_avgPrice).mul(quantity).toFixed(COMMON_PRICE_DISPLAY_DECIMALS)
}
