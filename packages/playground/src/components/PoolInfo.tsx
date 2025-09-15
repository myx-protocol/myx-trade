import { useContext, useMemo } from "react";
import { PoolContext } from "./PoolContext";

export const PoolInfo = () => {
  const { pools , poolId} = useContext(PoolContext);
  const pool = useMemo(() => {
    if (!poolId) return undefined;
    return pools?.find((_pool) => _pool.poolId === poolId)
  }, [pools, poolId]);
  
  return <header className={'border-1 p-[16px] flex flex-col gap-[10px]'}>
    <div>当前Pool：</div>
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
        <span>Base token:</span>
        <span>{pool?.quoteToken || '--'}</span>
      </div>
      <div className={'flex gap-[10px]'}>
        <span>Base poolToken:</span>
        <span>{pool?.quotePoolToken || '--'}</span>
      </div>
    </div>
  </header>
}
