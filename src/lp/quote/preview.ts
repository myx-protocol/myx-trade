import { getQuotePoolContract } from "@/web3/providers";
import { previewAmountOutParams } from "@/lp/type";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains/index";
import { getErrorTextFormError } from "@/config/error";

export const previewLpAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    
    // console.log("previewLpAmountOut data", [poolId, amountIn, price]);
    const quotePoolContract = await getQuotePoolContract(chainId);
    const _gasLimit = await quotePoolContract.previewLpAmountOut.estimateGas(poolId, amountIn, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await quotePoolContract.previewLpAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    })
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
    const _gasLimit = await quotePoolContract.previewQuoteAmountOut.estimateGas(poolId, amountIn, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await quotePoolContract.previewQuoteAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    })
    // console.log('previewQuoteAmountOut response', request)
    return request
  } catch (error) {
    console.error(error)
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
