import { getErrorTextFormError } from "@/config/error.js";
import { sdkError } from "@/logger";
import { getMarketManageContract } from "@/web3/providers.js";
import { ChainId } from "@/config/chain.js";
import { checkParams } from "@/common/checkParams.js";

export const getOracleFee = async (chainId: ChainId, marketId: string)  => {
  try {
    await checkParams({chainId})
    if (!marketId) return
    
    const contract = await getMarketManageContract(chainId)
    
    const request = await contract.read.getOracleFee([marketId])
    // console.log("MarketManage.getOracleFee request", request);
    
    // console.log(request)
    return request;
  } catch (error) {
    sdkError(error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
