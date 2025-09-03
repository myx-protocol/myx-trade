import { getPools } from "@/api";

export const getPoolInfo = async (poolId: string) => {
  try {
    const pools = (await getPools ()).data || [];
    const pool  = pools.find((_pool) => _pool.poolId === poolId);
    
    if (!pool) return null;
    
    return pool;
  } catch (e) {
    console.error(e)
    throw e;
  }
}
