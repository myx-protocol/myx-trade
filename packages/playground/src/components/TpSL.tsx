import { useCallback, useContext, useEffect, useState } from "react";
import { PoolContext, TpSlContext } from "./PoolContext";
import { usePoolInfo } from "./PoolInfo";
import {pool as Pool } from "@myx-trade/sdk";
import { message, Radio, type RadioChangeEvent } from "antd";
import { Button } from "@components/Button.tsx";
// import { formatUnits } from "ethers/lib.esm";

export const TpOrSL = ({className = '', amount = '', triggerPrice = '', onAmountChange , onPriceChange } : {className?: string, amount?: string | number, triggerPrice?: string|number,onAmountChange?: (value:string | number) => void ,onPriceChange?: (value:string | number) => void }) => {
  return <div className={`flex flex-col gap-[10px] ${className}`}>
    {/*<div>poolId: {poolId}</div>*/}
    <div className={'flex gap-[10px]'}>
      <div className={'flex items-center gap-[5px]'}><label>Amount: </label><input type="number" className={'border-1 flex-1 p-[8px] '}  value={amount} onChange={e => onAmountChange?.(e.target.value)}/></div>
      <div className={'flex items-center gap-[5px]'}><label>TriggerPrice: </label><input type="number" className={'border-1 flex-1 p-[8px]'} value={triggerPrice}  onChange={e => onPriceChange?.(e.target.value)} /></div>
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
  const [poolType, setPoolType] = useState<Pool.PoolType>(Pool.PoolType.Base)
  
  
  
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
    ].filter((item) => item.amount && item.triggerPrice)
    
    const params: Pool.AddTpSLParams = {
      slippage: Number(slippage),
      poolId,
      chainId,
      poolType: poolType,
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
    
  },[poolId, tpPrice,tpAmount, slAmount,slPrice, slippage, poolType])
  
  const onChange = (e: RadioChangeEvent) => {
    setPoolType(e.target.value);
  };
  
  /*const getBasePoolBalance = async () => {
    setTpAmount('')
    setSlAmount('')
    if (!poolId || !account) return
    if (pool?.quoteToken && account) {
      const bigintBalance = await getBalanceOf(chainId, account, pool?.basePoolToken)
      const _balance = formatUnits(bigintBalance, Market[chainId].lpDecimals)
      setBasePoolBalance(_balance)
    }
  }
  
  const getQuotePoolBalance = async () => {
    setQuotePoolBalance('')
    if (!poolId || !account) return
    if (pool?.quoteToken && account) {
      const bigintBalance = await getBalanceOf(chainId, account, pool?.quotePoolToken)
      const _balance = formatUnits(bigintBalance,Market[chainId].lpDecimals)
      setQuotePoolBalance(_balance)
    }
  }*/
  
  useEffect(() => {
    if (pool) {
    
    }
  },[pool])
  
  
  return <TpSlContext.Provider value={{tpAmount, tpPrice, slAmount, slPrice, setTpAmount,setTpPrice, setSlAmount,setSlPrice }}>
    <div className={`flex flex-col gap-[10px] ${className}`}>
      {/*<div>poolId: {poolId}</div>*/}
      
      <div className={'flex gap-[10px] flex-col'}>
        <div className={'flex items-center gap-[5px]'}><label>Slippage: </label><input  readOnly={true} className={'border-1 flex-1 p-[8px] '}  value={slippage} /></div>
        <div className={'flex items-center gap-[5px]'}><label>Type:</label>
          <Radio.Group
            onChange={onChange}
            value={poolType}
            options={[
              { value: Pool.PoolType.Base, label: 'Base' },
              { value: Pool.PoolType.Quote, label: 'Quote' },
            ]}
          />
        </div>
      </div>
      <div className={'flex gap-[10px]'} >
        <label>TP: </label>
        <TpOrSL amount={tpAmount} onAmountChange={setTpAmount} triggerPrice={tpPrice} onPriceChange={setTpPrice} />
        
      </div>
      <div className={'flex gap-[10px]'} >
        <label>SL: </label>
        <TpOrSL amount={slAmount} onAmountChange={setSlAmount} triggerPrice={slPrice} onPriceChange={setSlPrice} />
      
      </div>
      <div className={'w-[200px]'}>
        <Button label={'AddTpSl'} isLoading={loading}  onClick={onHandleTpSl}/>
      </div>
     
    </div>
  </TpSlContext.Provider>
  
}
