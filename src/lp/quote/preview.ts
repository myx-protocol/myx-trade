import { getQuotePoolContract } from "@/web3/providers.js";
import { previewAmountOutParams } from "@/lp/type.js";
import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";

export const previewLpAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const quotePoolContract = await getQuotePoolContract(chainId);
    const request = await quotePoolContract.read.previewLpAmountOut(
      [poolId, amountIn, price],
    )
    return request
  } catch (error) {
    sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


export const previewQuoteAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const quotePoolContract = await getQuotePoolContract(chainId);
    const request = await quotePoolContract.read.previewQuoteAmountOut(
      [poolId, amountIn, price],
    )
    return request
  } catch (error) {
    sdkError(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
