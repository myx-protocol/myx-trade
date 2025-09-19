import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { Button } from "@/components";
import { pool, quote, Market } from "@myx-trade/sdk";
import { message } from "antd";

export const Deploy = () => {
  const { refetch,chainId} = useContext(PoolContext);
  const {pools} = useContext(PoolContext);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const onHandleDeploy = useCallback(async () => {
    console.log("Deploying...", address);
    
    if (!address) return;
    if (pools?.map(pool => pool.baseToken.toLowerCase()).includes(address.toLowerCase())) {
      message.error('Invalid base token address');
      return;
    }
    try {
      setIsLoading(true);
      const poolId = await pool.createPool({chainId,  baseToken: address });
      if (!poolId) return;
      await quote.deposit({
        poolId,
        amount: Number(Market[chainId].poolPrimeThreshold),
        chainId,
        slippage: 0.01
      })
      refetch()
      message.success("Deploy successfully")
    } finally {
      setIsLoading(false)
    }
   
  }, [refetch, address]);
  
  return <div className="flex gap-[20px] px-[10px] py-[20px]">
    <input className={'w-[420px] border-1'} onChange={e => setAddress(e.target.value)} value={address} placeholder={'Base Token Address'}/>
    <Button label={'Deploy'} isLoading={isLoading} onClick={onHandleDeploy } />
  </div>
}
