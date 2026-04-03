import { getPoolDetail, type MarketPool } from "@/api/index.js";
import { ChainId } from "@/config/chain.js";
import { getErrorTextFormError } from "@/config/error.js";


export const getPoolInfo = async (chainId: ChainId, poolId: string) => {
  try {
    if (!chainId || !poolId) return
    const response  = await getPoolDetail(chainId, poolId);
    const pool: MarketPool = response.data
    return pool;
  } catch (error) {
    throw typeof error === "string" ? error : (await getErrorTextFormError (error))
  }
}
