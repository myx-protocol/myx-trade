import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { Button } from "@/components";
import { pool } from "@myx-trade/sdk";
import { message } from "antd";

export const Deploy = ({className = ''}:{className?:string}) => {
  const { refetch,chainId} = useContext(PoolContext);
  const {pools, marketId} = useContext(PoolContext);
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const onHandleDeploy = useCallback(async () => {
    console.log("Deploying...", address);
    
    if (!address || !marketId) return;
    if (pools?.map(pool => pool.baseToken.toLowerCase()).includes(address.toLowerCase())) {
      message.error('Invalid base token address');
      return;
    }
    try {
      setIsLoading(true);
      const poolId = await pool.createPool({chainId,  baseToken: address, marketId });
      if (!poolId) return;
      /*await quote.deposit({
        poolId,
        amount: Number(Market[chainId].poolPrimeThreshold),
        chainId,
        slippage: 0.01
      })*/
      refetch()
      message.success("Create Pool successfully")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setIsLoading(false)
    }
   
  }, [refetch, address]);
  
  return <div className={ `flex items-center gap-[20px] ${className}` }>
    <label>Base Token Address:</label>
    <input className={'w-[420px] border-1 p-[8px]'} onChange={e => setAddress(e.target.value)} value={address} placeholder={'Base Token Address'}/>
    <Button label={'Create Pool'} isLoading={isLoading} onClick={onHandleDeploy } />
  </div>
}
