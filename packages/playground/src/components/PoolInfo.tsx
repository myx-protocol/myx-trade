import {  useContext, useEffect, useMemo, useState } from "react";
import { PoolContext } from "./PoolContext";
import { formatUnits } from "ethers";
import { Market, getBalanceOf, MarketPoolState } from "@myx-trade/sdk";
import { RefreshRight } from "./Icon";
import { Tag } from "antd";

// eslint-disable-next-line react-refresh/only-export-components
export const usePoolInfo = () => {
  const { pools , poolId} = useContext(PoolContext);
  const pool = useMemo(() => {
    if (!poolId) return undefined;
    return pools?.find((_pool) => _pool.poolId === poolId)
  }, [pools, poolId]);
  return {pool, poolId};
}


export const BalanceInfo = () => {
  const {chainId, account} = useContext(PoolContext)
  const {pool, poolId} = usePoolInfo()
  const [quoteBalance, setQuoteBalance] = useState<string>('')
  const [quotePoolBalance, setQuotePoolBalance] = useState<string>('')
  const [baseBalance, setBaseBalance] = useState<string>('')
  const [basePoolBalance, setBasePoolBalance] = useState<string>('')
  const getQuoteBalance = async () => {
    setQuoteBalance('')
    if (!poolId || !account) return
    if (pool?.quoteToken && account) {
      const bigintBalance = await getBalanceOf(chainId, account, pool?.quoteToken)
      const _balance = formatUnits(bigintBalance, pool.quoteDecimals)
      setQuoteBalance(_balance)
    }
  }
  
  const getBaseBalance = async () => {
    setBaseBalance('')
    if (!poolId || !account) return
    
    if (pool?.quoteToken && account) {
      const bigintBalance = await getBalanceOf(chainId, account, pool?.baseToken)
      const _balance = formatUnits(bigintBalance, pool.baseDecimals)
      setBaseBalance(_balance)
    }
  }
  
  const getBasePoolBalance = async () => {
    setBasePoolBalance('')
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
  }
  useEffect(() => {
    getBaseBalance ().then ()
    getQuoteBalance ().then ()
    getBasePoolBalance ().then ()
    getQuotePoolBalance ().then ()
  }, [chainId, account, poolId, pool])
  
  return <div className={'flex flex-col gap-[10px] '}>
    <div className={'flex gap-[50px]'}>
      <div className={'flex items-center gap-[10px]'}>
        <span>Base Balance</span>
        <span>{baseBalance || '--'}</span>
        <RefreshRight className={'text-[#1677ff]'} size={16} onClick={() => getBaseBalance()} />
      </div>
      <div className={'flex items-center gap-[10px]'}>
        <span>Quote Balance</span>
        <span>{quoteBalance || '--'}</span>
        <RefreshRight className={'text-[#1677ff]'} size={16} onClick={() => getQuoteBalance()} />
      </div>
    </div>
    
    <div className={'flex gap-[50px]'}>
      <div className={'flex items-center gap-[10px]'}>
        <span>Base Pool Balance</span>
        <span>{basePoolBalance || '--'}</span>
        <RefreshRight className={'text-[#1677ff]'} size={16} onClick={() => getBasePoolBalance()} />
      </div>
      
      
      <div className={'flex items-center gap-[10px]'}>
        <span>Quote Pool Balance</span>
        <span>{quotePoolBalance || '--'}</span>
        <RefreshRight className={'text-[#1677ff]'} size={16} onClick={() => getQuotePoolBalance()} />
      </div>
    </div>
  
  </div>
  
}


export const PoolInfo = () => {
 const { pool, poolId } = usePoolInfo()
  
  return <header className={'border-1 p-[16px] flex flex-col gap-[10px] sticky top-0 z-[10] bg-[#fff]'}>
    <div className={'flex items-center gap-[4px]'}>当前Pool：<span>{pool?.baseSymbol}{pool?.quoteSymbol}</span><Tag>{pool ? MarketPoolState[pool.state] : '--'}</Tag></div>
    <div className={'flex gap-[10px]'}>
      <span>Pool ID:</span>
      <span>{poolId || '--'}</span>
    </div>
    <div className={'flex flex-col gap-[5px]'}>
      <div className={'flex justify-between'}>
        <div className={'flex gap-[10px]'}>
          <span>Base:</span>
          <span>{pool?.baseSymbol || '--'}</span>
          
        </div>
        <div className={'flex gap-[10px]'}>
          <span>Decimals:</span>
          <span>{pool?.baseDecimals || '--'}</span>
        </div>
      </div>
      
      <div className={'flex gap-[10px]'}>
        <span>Base token:</span>
        <span>{pool?.baseToken || '--'}</span>
      </div>
      <div className={'flex gap-[10px]'}>
        <span>Base poolToken:</span>
        <span>{pool?.basePoolToken || '--'}</span>
      </div>
    </div>
    
    <div className={'flex flex-col gap-[5px]'}>
      <div className={'flex justify-between'}>
        <div className={'flex gap-[10px]'}>
          <span>Quote:</span>
          <span>{pool?.quoteSymbol || '--'}</span>
        </div>
        <div className={'flex gap-[10px]'}>
          <span>Decimals:</span>
          <span>{pool?.quoteDecimals || '--'}</span>
        </div>
      </div>
      
      <div className={'flex gap-[10px]'}>
        <span>Quote token:</span>
        <span>{pool?.quoteToken || '--'}</span>
      </div>
      <div className={'flex gap-[10px]'}>
        <span>Quote poolToken:</span>
        <span>{pool?.quotePoolToken || '--'}</span>
      </div>
    </div>
    
    <BalanceInfo/>
  </header>
}

