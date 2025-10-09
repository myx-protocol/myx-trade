import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { Button } from "@/components";
import { base } from "@myx-trade/sdk";
import { message } from "antd";

export const DepositBase = () => {
  const {chainId} = useContext(PoolContext)
  const {poolId} = usePoolInfo()
  const [amount, setAmount] = useState<string>('0.0001')
  const [slippage, setSlippage] = useState<string>('0.01')
  const [isDepositLoading, setIsDepositLoading] = useState(false)
  
  
  
  
  const onHandleDeposit = useCallback(async () => {
    if (!poolId || !amount || !slippage) return
    try {
      setIsDepositLoading(true)
      await base.deposit({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
      message.success("Deposit success")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setIsDepositLoading(false)
    }
    
  },[poolId, amount, slippage])
  
  
  
  return <div className={'flex flex-col gap-[10px]'}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] items-center'}>
      <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input type="number" className={'border-1 p-[8px]'} readOnly={false} value={slippage} onChange={(e) => setSlippage(e.target.value)} /></div>
      <div className={'flex items-center gap-[5px]'}><label>Amount:</label><input type="number" className={'border-1 p-[8px]'}  onChange={e => setAmount(e.target.value)} value={amount} placeholder={'Amount'} /></div>
      <Button label={'DepositBase'} isLoading={isDepositLoading} onClick={onHandleDeposit}/>
    </div>
  </div>
}
