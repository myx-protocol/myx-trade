// import { useCallback, useContext, useMemo, useState } from "react";
// import { PoolContext } from "./PoolProvider";
// import { Button } from "@/components";
// import { createPool } from "@/pool/create";

export const Deploy = () => {
  // const { refetch,chainId} = useContext(PoolContext);
  // const [address, setAddress] = useState("");
  
  // const onHandleDeploy = useCallback(async () => {
  //   if (!address) return;
  //   await createPool({chainId,  baseToken: address });
  //   refetch()
  // }, [refetch])
  
  return <div className="flex gap-[20px] px-[10px] py-[20px]">
    {/* <input className={'w-[420px] border-1'} onChange={e => setAddress(e.target.value)} value={address} placeholder={'Base Token Address'}/> */}
    {/* <Button label={'Deploy'} onClick={onHandleDeploy } /> */}
  </div>
}
