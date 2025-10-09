import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { Button } from "@/components";
import { Market , quote} from "@myx-trade/sdk";
import { message } from "antd";

export const DepositQuote = ({className = ''}: {className?: string}) => {
  const {chainId} = useContext(PoolContext)
  const {poolId} = usePoolInfo()
  const [amount, setAmount] = useState<string>(Market[chainId].poolPrimeThreshold.toString())
  const [slippage, setSlippage] = useState<string>('0.01')
  const [isDepositLoading, setIsDepositLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const onHandleDepositQuote = useCallback(async () => {
    console.log("depositQuote", poolId, amount, slippage)
    if (!poolId || !amount || !slippage) return
    console.log("depositQuote", poolId, amount)
    try {
      setIsDepositLoading(true)
      await quote.deposit({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
      message.success("Deposit success")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setIsDepositLoading(false)
    }
   
  },[poolId, amount, slippage])
  
  const onHandleWithdraw = useCallback(async () => {
    console.log("WithdrawQuote", poolId, amount, slippage)
    if (!poolId || !amount || !slippage) return
    console.log("WithdrawQuote", poolId, amount)
    try {
      setIsLoading(true)
      await quote.withdraw({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
      message.success("Withdraw success")
    } finally {
      setIsLoading(false)
    }
    
  },[poolId, amount, slippage])
  
  return <div className={`flex flex-col gap-[10px] ${className}`}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] items-center'}>
      <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input type="number" className={'border-1 p-[8px]'} readOnly={false} value={slippage} onChange={(e) => setSlippage(e.target.value)} /></div>
      <div className={'flex items-center gap-[5px]'}><label>Amount: </label><input type="number" className={'border-1 p-[8px]'}  onChange={e => setAmount(e.target.value)} value={amount} placeholder={'Amount'} /></div>
      <Button label={'DepositQuote'} isLoading={isDepositLoading} onClick={onHandleDepositQuote}/>
      <Button label={'WithdrawQuote'} isLoading={isLoading} onClick={onHandleWithdraw}/>
    </div>
  </div>
}
