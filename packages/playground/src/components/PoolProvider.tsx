import { createContext, ReactNode, useEffect, useMemo, useState } from "react";
import { ChainId } from "@/config/chain";
import { useQuery } from "@tanstack/react-query";
import { getPools } from "@/api";
import type { MarketPool } from "@/api/type";
export interface PoolContextValue {
  poolId?: string;
  chainId: ChainId;
  account?: string;
  pools?: MarketPool[];
  setPoolId: (poolId: string) => void;
  refetch: () => void;
  isLoading: boolean;
}
export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue);


export const PoolProvider = ({ children }: { children?: ReactNode }) => {
  const [poolId, setPoolId] = useState<string | undefined>();
  const [chainId] = useState<ChainId>(ChainId.ARB_TESTNET);
  const [account] = useState<string>('0xC410a0E83671A12250247F38e6F7906cb1964154');
  
  const {data: pools, isLoading, refetch} = useQuery({
    queryKey: ['getMarketPoolList'],
    queryFn: async () => {
      const response = await getPools()
      return response.data || []
    }
  })
  
  // const poolInfo = useMemo(() => {
  //   return pools?.find((_pool) => _pool.poolId === poolId)
  // }, [poolId, pools]);
  
  return (
    <PoolContext.Provider value={{poolId, chainId, account, pools, setPoolId, refetch, isLoading}}>
      {children}
    </PoolContext.Provider>
  )
}
