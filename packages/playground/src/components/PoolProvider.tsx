import { type ReactNode, useState } from "react";
import { ChainId } from "@/config/chain";
import { useQuery } from "@tanstack/react-query";
import { getPools } from "@/api";
import { PoolContext } from "./PoolContext";
import { useAccount } from "wagmi";


export const PoolProvider = ({ children }: { children?: ReactNode }) => {
  const [poolId, setPoolId] = useState<string | undefined>();
  const [chainId] = useState<ChainId>(ChainId.ARB_TESTNET);
  // const [account] = useState<string>('0xC410a0E83671A12250247F38e6F7906cb1964154');
  const  {address: account} = useAccount()
  
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
