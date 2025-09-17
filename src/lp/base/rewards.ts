import { RewardsParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { getBasePoolContract } from "@/web3/providers";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { getPrice } from "@/api";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";

export const getRewards = async (params: RewardsParams) => {
  try {
    const {chainId, account, poolId} = params;
    const chainInfo =  CHAIN_INFO[chainId];
    const lpAmountIn = 0n
    const priceResponse = await getPrice(chainId, [poolId]);
    const _price = priceResponse.data?.[0]?.price;
    if(!_price){
      return
    }
    const price = parseUnits(_price, COMMON_PRICE_DECIMALS)
    
    console.log("previewUserWithdrawData data", [poolId, lpAmountIn,account, price]);
    const basePoolContract = await getBasePoolContract(chainId);
    const _gasLimit = await basePoolContract.previewUserWithdrawData.estimateGas(poolId, lpAmountIn,account, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await basePoolContract.previewUserWithdrawData(poolId, lpAmountIn,account, price, {
      gasLimit,
      gasPrice
    })
    
    const {baseAmountOut, rebateAmount} = request
    
    return {
      baseAmountOut,
      rebateAmount,
    }
  
  } catch (e) {
    console.error(e);
    throw e;
  }
}
