import { getErrorTextFormError } from "@/config/error.js";
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
    
    return request;
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
