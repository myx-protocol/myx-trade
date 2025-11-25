import { getErrorTextFormError } from "@/config/error";
import { getMarketManageContract } from "@/web3/providers";
import { ChainId } from "@/config/chain";
import { checkParams } from "@/common/checkParams";

export const getMarket = async (chainId: ChainId, marketId: string)  => {
  try {
    await checkParams({chainId})
    if (!marketId) return
  
    const contract = await getMarketManageContract(chainId)
    
    const request = await contract.getMarket(marketId)
    console.log("MarketManage.getMarket request", request);
    
    return request;
  } catch (error) {
    console.error (error);
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
