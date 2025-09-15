import { getBasePoolContract, getQuotePoolContract } from "@/web3/providers";
import { ChainId } from "@/config/chain";
import { previewAmountOutParams } from "@/lp/type";
import { BytesLike } from "ethers";
import { QuotePool } from "@/abi/types/QuotePool";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { CHAIN_INFO } from "@/config/chains/index";

export const previewLpAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    
    console.log("previewLpAmountOut data", [poolId, amountIn, price]);
    const basePoolContract = await getBasePoolContract(chainId);
    const _gasLimit = await basePoolContract.previewLpAmountOut.estimateGas(poolId, amountIn, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await basePoolContract.previewLpAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    })
    console.log(request)
    return request
  } catch (e) {
    console.error(e)
    throw e;
  }
}


export const previewBaseAmountOut = async ({chainId, amountIn, poolId, price = 0n}: previewAmountOutParams) => {
  try {
    const chainInfo =  CHAIN_INFO[chainId];
    
    console.log("previewQuoteAmountOut data", [poolId, amountIn, price]);
    const basePoolContract = await getBasePoolContract(chainId);
    const _gasLimit = await basePoolContract.previewBaseAmountOut.estimateGas(poolId, amountIn, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await basePoolContract.previewBaseAmountOut(poolId, amountIn, price, {
      gasLimit,
      gasPrice
    })
    console.log('previewBaseAmountOut response', request)
    return request
  } catch (e) {
    console.error(e)
    throw e;
  }
}
