import { useCallback, useContext, useState } from "react";
import { Button } from "@components/index.ts";
import { pool } from "@myx-trade/sdk";
import { message } from "antd";
import { PoolContext } from "@components/PoolContext.ts";

export const CancelOrder = () => {
  const {chainId} = useContext(PoolContext)
  const [orderId, setOrderId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  
  
  
  
  const onHandleCancel = useCallback(async () => {
    try {
      if (!orderId) return
      await pool.cancelTpSl({orderId, chainId})
      message.success("Cancel Order successfully")
    } catch (e) {
      message.error(JSON.stringify(e))
    } finally {
      setIsLoading(false)
    }
  
  },[ orderId])
  
  
  
  return <div className={'flex flex-col gap-[10px]'}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] items-center'}>
      <div className={'flex items-center gap-[5px]'}><label>OrderId: </label><input  className={'border-1 p-[8px]'}  value={orderId} onChange={e => setOrderId(e.target.value)} /></div>
      <Button label={'Cancel'} isLoading={isLoading} onClick={onHandleCancel}/>
    </div>
  </div>
}
