import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { Button } from "@/components";
import { Market , quote} from "@myx-trade/sdk";

export const DepositQuote = () => {
  const {chainId} = useContext(PoolContext)
  const {poolId} = usePoolInfo()
  const [amount, setAmount] = useState<string>(Market[chainId].poolPrimeThreshold.toString())
  const [slippage] = useState<string>('0.01')
  
  const onHandleDepositQuote = useCallback(async () => {
    if (!poolId || !amount || !slippage) return
    await quote.deposit({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
  },[])
  return <div className={'flex flex-col gap-[10px]'}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] items-center'}>
      <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input type="number" className={'border-1'} readOnly={true} value={slippage} /></div>
      <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input type="number" className={'border-1'}  onChange={e => setAmount(e.target.value)} value={amount} placeholder={'Amount'} /></div>
      <Button label={'DepositQuote'} onClick={onHandleDepositQuote}/>
    </div>
  </div>
}
