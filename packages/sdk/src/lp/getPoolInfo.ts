import { getPoolDetail, type MarketPool } from "@/api";
import { ChainId } from "@/config/chain";


export const getPoolInfo = async (chainId: ChainId, poolId: string) => {
  try {
    if (!chainId || !poolId) return
    const response  = await getPoolDetail(chainId, poolId);
    const pool: MarketPool = response.data
    return pool;
  } catch (e) {
    throw e;
  }
}
