import { useCallback, useContext, useState } from "react";
import { PoolContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { Button } from "@/components";
import { base } from "@myx-trade/sdk";
import { message } from "antd";
import { formatUnits } from "ethers";
import { useQuery } from "@tanstack/react-query";

export const WithdrawBase = () => {
  const {chainId, account} = useContext(PoolContext)
  const {pool, poolId} = usePoolInfo()
  const [amount, setAmount] = useState<string>('0.0001')
  const [slippage] = useState<string>('0.01')
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false)
  
  const {data} = useQuery({
    queryKey: [{key: "previewUserWithdrawData"}, amount, poolId,account],
    enabled: !!amount && !!account && !!poolId,
    queryFn: async () => {
      if (!account || !poolId || !account) return
      const res = await base.previewUserWithdrawData(
        {
          chainId,
          amount,
          account,
          poolId
        })
      return res
      // console.log(res)
    }
  })
  
  const onHandleWithdraw = useCallback(async () => {
    if (!poolId || !amount || !slippage) return
    try {
      setIsWithdrawLoading(true)
      await base.withdraw({chainId, poolId, amount: Number(amount), slippage: Number(slippage) })
      message.success("Withdraw success")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setIsWithdrawLoading(false)
    }
    
  },[poolId, amount, slippage])
  
  return <div className={'flex flex-col gap-[10px]'}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px] items-center'}>
      <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input type="number" className={'border-1 p-[8px]'} readOnly={true} value={slippage} /></div>
      <div className={'flex items-center gap-[5px]'}><label>Amount:</label><input type="number" className={'border-1 p-[8px]'}  onChange={e => setAmount(e.target.value)} value={amount} placeholder={'Amount'} /></div>
      <div className={'flex gap-[10px]'}>
        <span>得到:</span>
        <span>{pool && data && formatUnits(data?.baseAmountOut, pool?.baseDecimals) + ` ${pool.baseSymbol}` || '--'}</span>
       
        <span>收益:</span>
        <span>{pool && data && formatUnits(data?.rebateAmount, pool?.quoteDecimals) + ` ${pool.quoteSymbol}`  || '--'}</span>
      </div>
      <Button label={'WithdrawBase'} isLoading={isWithdrawLoading} onClick={onHandleWithdraw}/>
    </div>
  </div>
}
