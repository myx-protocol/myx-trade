import { useCallback, useContext, useEffect, useState } from "react";
import { PoolContext } from "./PoolContext";
import {
  Market,
  getBalanceOf,
  MarketPoolState,
  pool as Pool,
  // base,
  // quote,
  getOraclePrice,
  formatUnits,
  parseUnits,
  COMMON_PRICE_DECIMALS,
  COMMON_LP_AMOUNT_DECIMALS
} from "@myx-trade/sdk";
import { RefreshRight } from "./Icon";
import { message, Tag } from "antd";
import { useQuery } from "@tanstack/react-query";
import { formatNumberPrecision } from "@/utils/format.ts";
import { Button } from "./Button";
// const  = 30
// eslint-disable-next-line react-refresh/only-export-components
export const usePoolInfo = () => {
  const { poolId, chainId, setPoolId} = useContext(PoolContext);
  
  const {data: pool}  = useQuery({
    queryKey: [{key: 'pool_detail_by_poolId'},poolId, chainId],
    queryFn: async () => {
      if (!poolId || !chainId) return null
      const result = await Pool.getPoolDetail(chainId, poolId);
     
      return result
    },
  })
  
  
  const refresh = async () => {
    const _poolId = poolId || '';
    setPoolId('');
    console.log('refresh');
    setTimeout(() => setPoolId(_poolId), 1000);
  }
  return {pool, poolId, refresh};
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
    if (!pool) return
    
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


export const PoolInfo = ({className = ''}:{className?:string}) => {
 const { pool, poolId, refresh } = usePoolInfo()
  const {chainId, account} = useContext(PoolContext)
  const [loading, setLoading] = useState<boolean>(false)
  
  const {data: price}  = useQuery({
    queryKey: [{key: 'pirce'},poolId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId ) return null
      const result = await getOraclePrice(
        chainId,
        [poolId],
      )
      if (result) {
        return result?.data?.[0]?.price
      }
      return
    },
    refetchInterval: 5000
  })
  
  // const {data: baseLpPrice}  = useQuery({
  //   queryKey: [{key: 'baseLpPrice'},poolId],
  //   enabled: !!poolId,
  //   queryFn: async () => {
  //     if (!poolId ) return null
  //     const result = await base.getLpPrice(
  //       chainId,
  //       poolId,
  //     )
  //     if (result) {
  //       return formatUnits(result, COMMON_PRICE_DECIMALS)
  //     }
  //     return
  //   },
  //   refetchInterval: 5000
  // })
  
  // const {data: quoteLpPrice}  = useQuery({
  //   queryKey: [{key: 'quoteLpPrice'},poolId],
  //   enabled: !!poolId,
  //   queryFn: async () => {
  //     if (!poolId ) return null
  //     const result = await quote.getLpPrice(
  //       chainId,
  //       poolId,
  //     )
  //     if (result) {
  //       return formatUnits(result, COMMON_PRICE_DECIMALS)
  //     }
  //     return
  //   },
  //   refetchInterval: 5000
  // })
  
  const {data: userShareBase}  = useQuery({
    queryKey: [{key: 'userShareBase'},poolId, pool],
    enabled: !!poolId && !!pool?.quotePoolToken,
    queryFn: async () => {
      if (!poolId || !pool) return null
      const result = await Pool.getUserGenesisShare(chainId, pool?.basePoolToken, account as string)
      
      if (result) {
        return formatUnits(result, Market[chainId].lpDecimals)
      }
      return
    }
  })
  
  const {data: userShare}  = useQuery({
    queryKey: [{key: 'userShare'},poolId, pool],
    enabled: !!poolId && !!pool?.quotePoolToken,
    queryFn: async () => {
      if (!poolId || !pool) return null
      const result = await Pool.getUserGenesisShare(chainId, pool?.quotePoolToken, account as string)
      
      if (result) {
        return formatUnits(result, Market[chainId].lpDecimals)
      }
      return
    }
  })
  
  const onReprime = useCallback(async () => {
    try {
      if (!poolId) return
      setLoading(true)
      await Pool.reprime(chainId, poolId)
      message.success('Pool reprime')
      await refresh()
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [poolId, chainId])
  
  
  const {data: info}  = useQuery({
    queryKey: [{key: 'poolContractInfo'},poolId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId || !price) return
      const result = await Pool.getPoolInfo(
        chainId,
        poolId,
        parseUnits(price, COMMON_PRICE_DECIMALS)
      )
      
      if (result) {
        return {
          basePool: {
            poolTokenPrice: formatUnits(result.basePool.poolTokenPrice, COMMON_PRICE_DECIMALS),
            poolTokenSupply: formatUnits(result.basePool.poolTokenSupply, COMMON_LP_AMOUNT_DECIMALS) ,
          },
          quotePool: {
            poolTokenPrice: formatUnits(result.quotePool.poolTokenPrice, COMMON_PRICE_DECIMALS),
            poolTokenSupply: formatUnits(result.quotePool.poolTokenSupply, COMMON_LP_AMOUNT_DECIMALS) ,
          }
        }
      }
      
      return  result
      
    },
    refetchInterval: 5000
  })
  
  return <header className={`border-1 text-[12px] p-[16px] flex flex-col gap-[10px] sticky top-0 z-[10] bg-[#fff] ${className}`}>
    <div className={'flex items-center gap-[4px]'}>
      当前Pool：
      <span>{pool?.baseSymbol}{pool?.quoteSymbol}</span>
      <Tag>{pool ? MarketPoolState[pool.state] : '--'}</Tag>
      <div className={'ml-[16px] font-bold flex items-center gap-[4px]'}>
        <span>Price:</span>
        <span className={''}>
          {price ? formatNumberPrecision(price) : '--'}
        </span>
        <span>{pool?.quoteSymbol || ''}</span>
      </div>
      <div className={'ml-[16px] font-bold flex items-center gap-[4px]'}>
        <span>LP Price(B):</span>
        <span className={''}>
          {info?.basePool?.poolTokenPrice  ? formatNumberPrecision(info?.basePool?.poolTokenPrice) : '--'}
        </span>
        <span>{pool?.quoteSymbol || ''}</span>
      </div>
      <div className={'ml-[16px] font-bold flex items-center gap-[4px]'}>
        <span>LP Price(U):</span>
        <span className={''}>
          {info?.quotePool?.poolTokenPrice ? formatNumberPrecision(info?.quotePool?.poolTokenPrice) : '--'}
        </span>
        <span>{pool?.quoteSymbol || ''}</span>
      </div>
      <div className={'ml-[16px] font-bold flex items-center gap-[4px]'}>
        <span>创世LP(B):</span>
        <span className={''}>
          {userShareBase ? formatNumberPrecision(userShareBase, 4) : '0'}
        </span>
        {/*<span>{}</span>*/}
      </div>
      <div className={'ml-[16px] font-bold flex items-center gap-[4px]'}>
        <span>创世LP(U):</span>
        <span className={''}>
          {userShare ? formatNumberPrecision(userShare) : '0'}
        </span>
        {/*<span>{}</span>*/}
      </div>
      {
        pool?.state === MarketPoolState.Bench && <Button label={'重新上架'} isLoading={loading}  onClick={onReprime}/>
      }
    </div>
    <div className={'flex gap-[10px]'}>
      <span>Pool ID:</span>
      <span>{poolId || '--'}</span>
    </div>
    <div className={'flex flex-col gap-[5px]'}>
      <div className={'flex gap-[30px]'}>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Base:</span>
          <span>{pool?.baseSymbol || '--'}</span>
          
        </div>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Decimals:</span>
          <span>{pool?.baseDecimals || '--'}</span>
        </div>
        
      </div>
      
      <div className={'flex gap-[10px]'}>
        <span>Base token:</span>
        <span>{pool?.baseToken || '--'}</span>
      </div>
      <div className={'flex gap-[30px]'}>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Base poolToken:</span>
          <span>{pool?.basePoolToken || '--'}</span>
        </div>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Decimals:</span>
          <span>{COMMON_LP_AMOUNT_DECIMALS || '--'}</span>
        </div>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Amount:</span>
          <span>{info?.basePool?.poolTokenSupply || '--'}</span>
        </div>
      </div>
      
    </div>
    
    <div className={'flex flex-col gap-[5px]'}>
      <div className={'flex gap-[30px]'}>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Quote:</span>
          <span>{pool?.quoteSymbol || '--'}</span>
        </div>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Decimals:</span>
          <span>{pool?.quoteDecimals || '--'}</span>
        </div>
        
        
      </div>
      
      <div className={'flex gap-[10px]'}>
        <span>Quote token:</span>
        <span>{pool?.quoteToken || '--'}</span>
      </div>
      <div className={'flex gap-[30px]'}>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Quote poolToken:</span>
          <span>{pool?.quotePoolToken || '--'}</span>
        </div>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Decimals:</span>
          <span>{COMMON_LP_AMOUNT_DECIMALS || '--'}</span>
        </div>
        <div className={'flex gap-[10px] flex-1'}>
          <span>Amount:</span>
          <span>{info?.quotePool?.poolTokenSupply || '--'}</span>
        </div>
      </div>
    </div>
    
    <BalanceInfo/>
  </header>
}

