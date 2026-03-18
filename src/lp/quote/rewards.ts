import { RewardsParams } from "@/lp/type.js";
import { CHAIN_INFO } from "@/config/chains/index.js";
import { getQuotePoolContract } from "@/web3/providers.js";
import { getOraclePrice } from "@/api/index.js";
import { parseUnits } from "viem";
import { COMMON_PRICE_DECIMALS } from "@/config/decimals.js";
import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";

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
  
    const request = await contract.read.pendingUserRebates(
      [poolId, account, price],
    )
    // console.log("pendingUserRebates quote result:", request);
    
    return request
  
  } catch (error) {
    sdkError(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
