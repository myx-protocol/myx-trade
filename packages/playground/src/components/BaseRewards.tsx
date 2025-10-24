import { useQuery } from "@tanstack/react-query";
import { usePoolInfo } from "./PoolInfo";
import { base } from "@myx-trade/sdk";
import { PoolContext } from "./PoolContext";
import { useCallback, useContext, useMemo, useState } from "react";
import { formatUnits } from "ethers";
import { Button } from "@/components";
import { message } from "antd";


export const BaseRewards = () => {
  const {chainId, account} = useContext(PoolContext);
  const {pool,poolId} = usePoolInfo()
  const [loading, setLoading] = useState<boolean>(false)
  
  const {data = null, refetch} = useQuery({
    queryKey: [{key: 'rewards'},poolId, account],
    enabled: !!poolId && !!account,
    queryFn: async () => {
      if (!poolId || !account) return null
      const result = await base.getRewards({
        poolId,
        chainId,
        account
      })
      return result
    }
  })
  const disabled = useMemo(() => !data, [data] )
  const onHandleClaim = useCallback(async () => {
    if (!poolId || !account) return
    try {
      setLoading(true)
      await base.claim({chainId, poolId})
      message.success("Claim successfully claimed")
      await refetch()
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
    
  }, [chainId, poolId, account])
  return <div className="flex items-center gap-[20px]">
    <div className={'flex gap-[10px]'}>
      <span>Base Rewards:</span>
      <span>{pool && data !== null  ? formatUnits(data, pool?.quoteDecimals) + ` ${pool.quoteSymbol}`  : '--'}</span>
    </div>
    <Button label={'Claim'} disabled={disabled} isLoading={loading} onClick={onHandleClaim}/>
  </div>
}

