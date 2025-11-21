import { type ReactNode, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPools } from "@/api";
import { PoolContext } from "./PoolContext";
import { useAccount, useChainId } from "wagmi";
import { getMarketList } from "@myx-trade/sdk";


export const PoolProvider = ({ children }: { children?: ReactNode }) => {
  const [marketId, setMarketId] = useState<string | undefined>();
  const [poolId, setPoolId] = useState<string | undefined>();
  const chainId = useChainId();
  // const [account] = useState<string>('0xC410a0E83671A12250247F38e6F7906cb1964154');
  const  {address: account} = useAccount()
  // const { data: walletClient } = useWalletClient();
  
  const {data: pools, isLoading, refetch} = useQuery({
    queryKey: ['getMarketPoolList'],
    queryFn: async () => {
      const response = await getPools()
      return response.data || []
    }
  })
  
  const {data: markets} = useQuery({
    queryKey: [{key: "markets"}],
    queryFn: async () => {
      const result = await getMarketList();
      return (result?.data || []).filter(m => m.chainId === chainId);
    }
  })
  
  useEffect(() => {
    if (markets && markets.length && chainId) {
      setMarketId(markets?.[0]?.marketId);
    }
  }, [chainId, markets]);
  
  // useEffect(() => {
  //   if (walletClient?.transport) {
  //     const provider = new BrowserProvider(walletClient.transport);
  //     // const signer = await provider.getSigner();
  //     if (provider){
  //       MxSDK.getInstance().setProvider(provider)
  //     }
  //   }
  //
  // },[walletClient]);
  
  
  // const poolInfo = useMemo(() => {
  //   return pools?.find((_pool) => _pool.poolId === poolId)
  // }, [poolId, pools]);
  
  return (
    <PoolContext.Provider value={{markets, marketId, setMarketId, poolId, chainId, account, pools, setPoolId, refetch, isLoading}}>
      {children}
    </PoolContext.Provider>
  )
}
