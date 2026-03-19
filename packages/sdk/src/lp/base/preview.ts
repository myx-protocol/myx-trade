import { getBasePoolContract } from "@/web3/providers.js";
import { previewAmountOutParams, PreviewWithdrawDataParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { getOraclePrice } from "@/api/index.js";
import { parseUnits } from "viem";
import { COMMON_LP_AMOUNT_DECIMALS, COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { checkParams } from "@/common/checkParams.js";
import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";

export const previewLpAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];

    // console.log("previewLpAmountOut data", [poolId, amountIn, price]);
    const basePoolContract = await getBasePoolContract(chainId);
    
    const request = await basePoolContract.read.previewLpAmountOut(
      [poolId, amountIn, price],
    )
    // console.log(request)
    return request
  } catch (error) {
    sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


export const previewBaseAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];

    // console.log("previewQuoteAmountOut data", [poolId, amountIn, price]);
    const basePoolContract = await getBasePoolContract(chainId);
   
    const request = await basePoolContract.read.previewBaseAmountOut(
      [poolId, amountIn, price],
    )
    // console.log('previewBaseAmountOut response', request)
    return request
  } catch (error) {
    sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}

export const previewUserWithdrawData = async ({ chainId, account, poolId, amount = 0 }: PreviewWithdrawDataParams) => {
  try {
   
    if (!chainId || !account || !poolId ) return
    if (!amount) {
      return  {
        baseAmountOut: 0n,
        rebateAmount: 0n
      }
    }
    const chainInfo =  CHAIN_INFO[chainId];
    const decimals = COMMON_LP_AMOUNT_DECIMALS;
    
    await checkParams ({
      // tokenAddress: lpAddress,
      decimals,
      account,
      chainId,
      amount: Number(amount),
    })
    
    const amountIn = parseUnits(amount.toString(), decimals);
    
    // todo ws price
    const priceResponse = await getOraclePrice(chainId, [poolId]);
    const _price = priceResponse.data?.[0]?.price || '0';
    
    const price = parseUnits(_price, COMMON_PRICE_DECIMALS)
    
    // console.log("previewUserWithdrawData data", [poolId, amountIn,account, price]);
    const basePoolContract = await getBasePoolContract(chainId);
    const request = await basePoolContract.read.previewUserWithdrawData(
      [poolId, amountIn, account, price],
    )
    
    const [baseAmountOut, rebateAmount] = request
    // console.log("previewUserWithdrawData result:", {baseAmountOut, rebateAmount});
    return {
      baseAmountOut,
      rebateAmount,
    }
    
  } catch (error) {
    // sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
