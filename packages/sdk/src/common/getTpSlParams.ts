import { ErrorCode, Errors } from "@/config/error";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { bigintAmountSlipperCalculator } from "@/common/tradingGas";
import type { TpSl, TpSLParams } from "@/lp/pool";
import { getDecimalPlaces } from "@/utils/number";
import { Market } from "@/config/market";

export const getTpSlParams = (slippage: number = 0.01, tpsl: TpSl[] = [], decimals = 18, quoteDecimal: number) => {
  if (tpsl.length === 0) {
    return []
  }
  if (tpsl.filter(item => item.amount && item.triggerPrice && item.triggerType).length === 0) {
    throw new Error(Errors[ ErrorCode.Invalid_Params]);
  }
  
  
  const tpslParams = tpsl.map(item => {
    const amount = parseUnits(item.amount.toString(), decimals)
    const triggerPrice = parseUnits(item.triggerPrice.toString(), COMMON_PRICE_DECIMALS)
    const decimal = getDecimalPlaces(item.triggerPrice.toString())
    const price = parseUnits(item.triggerPrice.toString(), decimal)
    const minQuoteOut = bigintAmountSlipperCalculator(amount * price * BigInt(10 ** quoteDecimal)/ BigInt(10 ** (decimal + decimals)), slippage)
    return {
      amount,
      triggerPrice,
      triggerType: BigInt(item.triggerType),
      minQuoteOut
    } as TpSLParams
  })
  
  return tpslParams
}
