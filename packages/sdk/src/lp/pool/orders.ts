import { getPoolOpenOrders } from "@/api/index.js";
import { ChainId } from "@/config/chain.js";
import { sdkError } from "@/logger";
import { MxSDK } from "@/web3/index.js";

export const getOpenOrders = async (chainId: ChainId, address: string) => {
  try {
    // Automatically obtain accessToken; it will be refreshed if missing or expired
    const accessToken = await MxSDK.getInstance().getConfigManager()?.getAccessToken();
    if (!accessToken) {
      throw new Error(
        "Failed to obtain accessToken"
      )
    }
    const response = await getPoolOpenOrders(accessToken, address, chainId)
    return response.data || [];

  } catch (error) {
    sdkError(error);
    throw error;
  }
}
