import { useCallback, useContext, useEffect, useState } from "react";
import { PoolContext, TpSlContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import { pool as Pool } from "@myx-trade/sdk";
import { message } from "antd";
import { Button } from "@components/Button.tsx";

export const TpOrSL = ({className = '', amount = '', triggerPrice = '', onAmountChange , onPriceChange } : {className?: string, amount?: string | number, triggerPrice?: string|number,onAmountChange?: (value:string | number) => void ,onPriceChange?: (value:string | number) => void }) => {
  return <div className={`flex flex-col gap-[10px] ${className}`}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px]'}>
      <div className={'flex items-center gap-[5px]'}><label>Amount: </label><input  className={'border-1 flex-1 p-[8px] '}  value={amount} onChange={e => onAmountChange?.(e.target.value)}/></div>
      <div className={'flex items-center gap-[5px]'}><label>TriggerPrice: </label><input  className={'border-1 flex-1 p-[8px]'} value={triggerPrice}  onChange={e => onPriceChange?.(e.target.value)} /></div>
    </div>
  </div>
}

export const TpSL = ({className = ''}: {className?: string}) => {
  const {chainId} = useContext(PoolContext)
  const {poolId, pool} = usePoolInfo()
  const [loading, setLoading] = useState(false)
  const [tpAmount, setTpAmount] = useState<string | number>("")
  const [tpPrice, setTpPrice] = useState<string | number>("")
  const [slAmount, setSlAmount] = useState<string | number>("")
  const [slPrice, setSlPrice] = useState<string | number>("")
  const [slippage] = useState<string>('0.01')
  
  
  
  const onHandleTpSl = useCallback(async () => {
    
    if (!poolId ) return
    const tpsl = [
      {
        amount: Number(tpAmount),
        triggerPrice: Number(tpPrice),
        triggerType: Pool.TriggerType.TP
      },
      {
        amount: Number(slAmount),
        triggerPrice: Number(slPrice),
        triggerType: Pool.TriggerType.SL
      }
    ]
    const params: Pool.AddTpSLParams = {
      slippage: Number(slippage),
      poolId,
      chainId,
      poolType: Pool.PoolType.Base,
      tpsl
    }
    console.log("addTpsl params:", params)
    try {
      setLoading(true)
      const rs = await Pool.addTpSl(params)
      console.log("addTpSL ", rs)
      message.success("Transfer success")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
    
  },[poolId, tpPrice,tpAmount, slAmount,slPrice, slippage])
  
  
  useEffect(() => {
    if (pool) {
    
    }
  },[pool])
  
  
  return <TpSlContext.Provider value={{tpAmount, tpPrice, slAmount, slPrice, setTpAmount,setTpPrice, setSlAmount,setSlPrice }}>
    <div className={`flex flex-col gap-[10px] ${className}`}>
      {/*<div>poolId: {poolId}</div>*/}
      
      <div className={'flex gap-[10px] flex-col'}>
        <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input  readOnly={true} className={'border-1 flex-1 p-[8px] '}  value={slippage} /></div>
      </div>
      <div className={'flex gap-[10px] flex-col'} >
        <label>TP: </label>
        <TpOrSL amount={tpAmount} onAmountChange={setTpAmount} triggerPrice={tpPrice} onPriceChange={setTpPrice} />
        
      </div>
      <div className={'flex gap-[10px] flex-col'} >
        <label>SL: </label>
        <TpOrSL amount={slAmount} onAmountChange={setSlAmount} triggerPrice={slPrice} onPriceChange={setSlPrice} />
      
      </div>
      <Button label={'AddTpSl'} isLoading={loading} onClick={onHandleTpSl}/>
    </div>
  </TpSlContext.Provider>
  
}
