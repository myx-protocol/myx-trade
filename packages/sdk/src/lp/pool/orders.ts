import { getPoolOpenOrders } from "@/api";
import { ChainId } from "@/config/chain";
import { MxSDK } from "@/web3";

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
    console.error(error);
    throw error;
  }
}
