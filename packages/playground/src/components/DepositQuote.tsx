import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { Button } from "@/components";
import { Market , quote} from "@myx-trade/sdk";

export const DepositQuote = ({className = ''}: {className?: string}) => {
  const {chainId} = useContext(PoolContext)
  const {poolId} = usePoolInfo()
  const [amount, setAmount] = useState<string>(Market[chainId].poolPrimeThreshold.toString())
  const [slippage] = useState<string>('0.01')
  
  const onHandleDepositQuote = useCallback(async () => {
    console.log("depositQuote", poolId, amount, slippage)
    if (!poolId || !amount || !slippage) return
    console.log("depositQuote", poolId, amount)
    await quote.deposit({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  },[poolId, amount, slippage])
  
  const onHandleWithdraw = useCallback(async () => {
    console.log("WithdrawQuote", poolId, amount, slippage)
    if (!poolId || !amount || !slippage) return
    console.log("WithdrawQuote", poolId, amount)
    await quote.withdraw({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  },[poolId, amount, slippage])
  
  return <div className={`flex flex-col gap-[10px] ${className}`}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] items-center'}>
      <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input type="number" className={'border-1'} readOnly={true} value={slippage} /></div>
      <div className={'flex items-center gap-[5px]'}><label>Amount: </label><input type="number" className={'border-1'}  onChange={e => setAmount(e.target.value)} value={amount} placeholder={'Amount'} /></div>
      <Button label={'DepositQuote'} onClick={onHandleDepositQuote}/>
      <Button label={'WithdrawQuote'} onClick={onHandleWithdraw}/>
    </div>
  </div>
}
