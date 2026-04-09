import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { getMarketManageContract } from "@/web3/providers.js";
import { ChainId } from "@/config/chain.js";
import { checkParams } from "@/common/checkParams.js";

export const getMarket = async (chainId: ChainId, marketId: string)  => {
  try {
    await checkParams({chainId})
    if (!marketId) return
  
    const contract = await getMarketManageContract(chainId)
    
    const request = await contract.read.getMarket([marketId])
    // console.log("MarketManage.getMarket request", request);
    const {quoteToken,baseReserveRatio, quoteReserveRatio, oracleFeeUsd, boostFeeUsd, boostRefundFeeUsd, poolPrimeThreshold, executionFee, maxExecutionFee, forwardFee, maxForwardFee} = request
    return request;
  } catch (error) {
    sdkError(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
