import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PoolContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { Button } from "@/components";
import { quote} from "@myx-trade/sdk";
import { message } from "antd";

export const Transfer = ({className = ''}: {className?: string}) => {
  const {chainId} = useContext(PoolContext)
  const {poolId} = usePoolInfo()
  const [fromPool, setFromPool] = useState<string>(poolId || '')
  const [toPool, setToPool] = useState<string>('')
  const [amount, setAmount] = useState<number | string>(100)
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    setFromPool(poolId || '')
  },[poolId])
  
  const onHandleTransfer = useCallback(async () => {
    console.log("Transfer", fromPool, amount,toPool )
    if (!fromPool || !toPool || !amount) return
    console.log("WithdrawQuote", poolId, amount)
    try {
      setLoading(true)
      await quote.transfer(chainId, fromPool, toPool, Number(amount))
      message.success("Transfer success")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
    
  },[fromPool, amount, toPool])
  
  const disabled = useMemo(() => {
    return !fromPool || !toPool || !amount || fromPool === toPool
  },[fromPool, toPool,amount])
  
  return <div className={`flex flex-col gap-[10px] ${className}`}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] flex-col'}>
      <div className={'flex items-center gap-[5px]'}><label>FromPoolId: </label><input  className={'border-1 flex-1 p-[8px] '}  value={fromPool} onChange={e => setFromPool(e.target.value)}/></div>
      <div className={'flex items-center gap-[5px]'}><label>ToPoolId: </label><input  className={'border-1 flex-1 p-[8px]'} value={toPool}  onChange={e => setToPool(e.target.value)} /></div>
      <div className={'flex items-center gap-[5px]'}><label>Amount: </label><input type="number" className={'border-1 flex-1 p-[8px]'}  onChange={e => setAmount(e.target.value)} value={amount} placeholder={'Amount'} /></div>
      <Button label={'Transfer'} onClick={onHandleTransfer} disabled={disabled} isLoading={loading}/>
    </div>
  </div>
}
