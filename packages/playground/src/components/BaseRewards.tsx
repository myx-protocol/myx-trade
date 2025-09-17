import { useQuery } from "@tanstack/react-query";
import { usePoolInfo } from "./PoolInfo";
import { base } from "@myx-trade/sdk";
import { PoolContext } from "./PoolContext";
import { useCallback, useContext, useMemo } from "react";
import { formatUnits } from "ethers";
import { Button } from "@/components";


export const BaseRewards = () => {
  const {chainId, account} = useContext(PoolContext);
  const {pool,poolId} = usePoolInfo()
  
  const {data} = useQuery({
    queryKey: [{key: 'rewards'},poolId, account],
    queryFn: async () => {
      if (!poolId || !account) return undefined
      const result = await base.getRewards({
        poolId,
        chainId,
        account
      })
      return result
    }
  })
  const disabled = useMemo(() => !(data?.baseAmountOut && data?.baseAmountOut > 0n), [data?.baseAmountOut] )
  const onHandleClaim = useCallback(async () => {
    if (!poolId || !account) return
    await base.claim({chainId, poolId})
  }, [chainId, poolId, account])
  return <div className="flex items-center gap-[20px]">
    <div className={'flex gap-[10px]'}>
      <span>Base Rewards:</span>
      <span>{pool && data && formatUnits(data?.rebateAmount, pool?.quoteDecimals) + ` ${pool.quoteSymbol}`  || '--'}</span>
      <span>{pool && data && formatUnits(data?.baseAmountOut, pool?.baseDecimals) + ` ${pool.baseSymbol}` || '--'}</span>
    </div>
    <Button label={'Claim'} disabled={disabled}  onClick={onHandleClaim}/>
  </div>
}

