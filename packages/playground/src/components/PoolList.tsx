import { useCallback, useContext } from "react";
import { PoolContext } from "./PoolProvider";
import { MarketPool } from "@/api/type";
import './index.css'
import { Button } from "@/components";

export const PoolList = () => {
  const {pools, refetch, poolId, setPoolId, isLoading} = useContext(PoolContext);
  
  const onHandleChange = useCallback((pool:MarketPool) => {
    console.log(pool?.poolId);
    if (poolId !==pool.poolId) {
      setPoolId(pool.poolId)
    }
  }, [])
  
  return <div>
    <div className="flex gap-[10px]">
      {
        isLoading ? <span>Loading...</span> : <Button label={'refresh'} onClick={() => refetch()} />
      }
    </div>
    
    
    <ul>
      { (pools || [] as MarketPool[]).map((pool) => {
        return <li key={pool.poolId} className={'flex gap-[20px]'} onClick={() => onHandleChange(pool)}>
          <div>
            {pool.poolId === poolId ? '✔️': ' '}
          </div>
          <div className="flex gap-[10px]">
            <span>{pool.baseSymbol}</span>
            {/*<span>{pool.poolId}</span>*/}
            <span>copy</span>
          </div>
        </li>
      })
    }
    </ul>
  </div>
}
