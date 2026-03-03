import { RewardsParams } from "@/lp/type";
import { CHAIN_INFO } from "@/config/chains/index";
import { getQuotePoolContract } from "@/web3/providers";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas";
import { getOraclePrice } from "@/api";
import { parseUnits } from "ethers";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals";
import { getErrorTextFormError } from "@/config/error";

export const getRewards = async (params: RewardsParams) => {
  try {
    const {chainId, account, poolId} = params;
    if (!chainId || !account || !poolId) return
    const chainInfo =  CHAIN_INFO[chainId];
    
    // todo ws price
    const priceResponse = await getOraclePrice(chainId, [poolId]);
    const _price = priceResponse.data?.[0]?.price || '0';
    
    const price = parseUnits(_price, COMMON_PRICE_DECIMALS)
    
    // console.log("pendingUserRebates quote data", [poolId,account, price]);
    const contract = await getQuotePoolContract(chainId);
    const _gasLimit = await contract.pendingUserRebates.estimateGas(poolId,account, price)
    const gasLimit = bigintTradingGasToRatioCalculator(_gasLimit, chainInfo.gasLimitRatio)
    const {gasPrice}  = await bigintTradingGasPriceWithRatio(chainId)
    const request = await contract.pendingUserRebates(poolId,account, price, {
      gasLimit,
      gasPrice
    })
    
    console.log("pendingUserRebates quote result:", request);
    return request
  
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
