import { RewardsParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { getQuotePoolContract } from "@/web3/providers.js";
import { bigintTradingGasPriceWithRatio, bigintTradingGasToRatioCalculator } from "@/common/tradingGas.js";
import { getOraclePrice } from "@/api/index.js";
import { parseUnits } from "viem";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";

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
    // console.log("pendingUserRebates quote result:", request);
    
    return request
  
  } catch (error) {
    console.error(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
