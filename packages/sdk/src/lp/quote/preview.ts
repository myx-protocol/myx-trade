import { getQuotePoolContract } from "@/web3/providers.js";
import { previewAmountOutParams } from "@/lp/type.js";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { getErrorTextFormError } from "@/config/error.js";

export const previewLpAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];

    // console.log("previewLpAmountOut data", [poolId, amountIn, price]);
    const quotePoolContract = await getQuotePoolContract(chainId);
    const _gasLimit = await quotePoolContract.estimateGas!.previewLpAmountOut(
      [poolId, amountIn, price],
    )
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await quotePoolContract.read.previewLpAmountOut(
      [poolId, amountIn, price],
      {
        gasLimit,
        gasPrice,
      },
    )
    // console.log(request)
    return request
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}


export const previewQuoteAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];

    // console.log("previewQuoteAmountOut data", [poolId, amountIn, price]);
    const quotePoolContract = await getQuotePoolContract(chainId);
    const _gasLimit = await quotePoolContract.estimateGas!.previewQuoteAmountOut(
      [poolId, amountIn, price],
    )
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await quotePoolContract.read.previewQuoteAmountOut(
      [poolId, amountIn, price],
      {
        gasLimit,
        gasPrice,
      },
    )
    // console.log('previewQuoteAmountOut response', request)
    return request
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
