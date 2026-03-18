import { MarketPoolState } from "@/api";
import { OracleUpdatePrice } from "@/lp/type.ts";
import { getPriceData } from "@/common/price.ts";
import { parseUnits } from "viem";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.ts";
import { previewBaseAmountOut } from "@/lp/base/preview.ts";
import { bigintAmountSlipperCalculator } from "@/common/tradingGas.ts";
import { ChainId } from "@/config/chain.js";
import { PoolType } from "@/lp/pool/index.js";
import { previewQuoteAmountOut } from "@/lp/quote/preview.ts";

export const getWithdrawData = async (
  {
    amountIn,
    chainId,
    poolId,
    state,
    slippage,
    poolType,
    account
  }: {
    amountIn: bigint,
    account: string,
    chainId: ChainId,
    poolId: string,
    state:MarketPoolState,
    slippage: number,
    poolType: PoolType
  }) => {
  
  const isNeedPrice = !(state === MarketPoolState.Cook || state === MarketPoolState.Primed)
  
  const price: OracleUpdatePrice[] = []
  let value = 0n;
  let amountOut;
  const previewAmountOut = poolType === PoolType.Base ? previewBaseAmountOut : previewQuoteAmountOut
  // let _withdrawableLpAmount;
  if (isNeedPrice) {
    try {
      const priceData = await getPriceData (chainId, poolId)
      if (priceData) {
        const referencePrice = parseUnits (priceData.price, COMMON_PRICE_DECIMALS)
        price.push ({
          poolId: poolId as `0x${ string }`,
          oracleUpdateData: priceData.vaa as `0x${ string }`,
          publishTime: BigInt (priceData.publishTime),
          oracleType: priceData.oracleType,
        })
        amountOut = await previewAmountOut ({ chainId, poolId, amountIn, price: referencePrice })
        value = priceData.value
      }
    } catch (e) {
      console.error(e)
      amountOut = await previewAmountOut ({ chainId, poolId, amountIn })
    }
    // _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: referencePrice})
  } else {
    amountOut = await previewAmountOut ({ chainId, poolId, amountIn })
    // _withdrawableLpAmount = await withdrawableLpAmount({chainId, poolId, price: 0n})
  }
  
  /*if (_withdrawableLpAmount &&  amountIn > _withdrawableLpAmount) {
    throw new Error(Errors[ErrorCode.Invalid_Amount_Withdrawable_Lp_Amount]);
  }*/
  
  const data = {
    poolId,
    amountIn,
    minAmountOut: bigintAmountSlipperCalculator (amountOut, slippage),
    recipient: account
  }
  
  return {
    price,
    data,
    value
  }
}
