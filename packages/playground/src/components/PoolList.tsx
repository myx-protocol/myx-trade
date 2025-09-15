import { useCallback, useContext } from "react";
import { PoolContext } from "./PoolContext";
import type { MarketPool } from "@myx-trade/sdk";
import { Button } from "@/components";
import { CopyIcon, Radio, RadioChecked } from "./Icon";
import { pool } from "@myx-trade/sdk";

export const PoolList = () => {
  const {pools, refetch, poolId, setPoolId, isLoading, chainId} = useContext(PoolContext);
  
  const onHandleChange = useCallback((pool:MarketPool) => {
    console.log(pool?.poolId);
    if (poolId !==pool.poolId) {
      setPoolId(pool.poolId)
    }
  }, [])
  
  const onContractGetPools = useCallback(async () => {
    await pool.getMarketPools(chainId);
  }, [chainId])
  
  return <div>
    <div className="flex gap-[10px] ">
      {
        isLoading ? <span>Loading...</span> : <Button label={'refresh'} onClick={() => refetch()} />
      }
      {
        <Button label={'ContractPools'} onClick={onContractGetPools} />
      }
    </div>
    
    
    <ul>
      { (pools || [] as MarketPool[]).map((pool) => {
        return <li key={pool.poolId} className={'flex items-center gap-[6px]'} onClick={() => onHandleChange(pool)}>
          
            {pool.poolId === poolId ? <RadioChecked size={16}/>: <Radio size={16}/>}
          
          <div className="flex items-center gap-[10px]">
            <span>{pool.baseSymbol}{pool.quoteSymbol}</span>
            {/*<span>{pool.poolId}</span>*/}
            <span>
              <CopyIcon size={16}/>
            </span>
          </div>
        </li>
      })
    }
    </ul>
  </div>
}
