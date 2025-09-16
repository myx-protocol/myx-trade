import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { Button } from "@/components";
import { pool } from "@myx-trade/sdk";

export const Deploy = () => {
  const { refetch,chainId} = useContext(PoolContext);
  const [address, setAddress] = useState("");
  
  
  const onHandleDeploy = useCallback(async () => {
    console.log("Deploying...", address);
    
    if (!address) return;
    await pool.createPool({chainId,  baseToken: address });
    refetch()
  }, [refetch, address]);
  
  return <div className="flex gap-[20px] px-[10px] py-[20px]">
    <input className={'w-[420px] border-1'} onChange={e => setAddress(e.target.value)} value={address} placeholder={'Base Token Address'}/>
    <Button label={'Deploy'} onClick={onHandleDeploy } />
  </div>
}
