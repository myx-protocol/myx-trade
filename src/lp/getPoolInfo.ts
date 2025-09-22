import { getPoolDetail, getPools } from "@/api";
import { ChainId } from "@/config/chain";


export const getPoolInfo = async (chainId: ChainId, poolId: string) => {
  try {
    const response  = await getPoolDetail(chainId, poolId);
    const pool = response.data
    if (!pool) return null;
    
    return pool;
  } catch (e) {
    console.error(e)
    throw e;
  }
}
