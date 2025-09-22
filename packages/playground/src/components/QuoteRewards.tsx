import { useQuery } from "@tanstack/react-query";
import { usePoolInfo } from "./PoolInfo";
import { quote } from "@myx-trade/sdk";
import { PoolContext } from "./PoolContext";
import { useCallback, useContext, useMemo, useState } from "react";
import { formatUnits } from "ethers";
import { Button } from "@/components";
import { message } from "antd";


export const QuoteRewards = () => {
  const {chainId, account} = useContext(PoolContext);
  const {pool,poolId} = usePoolInfo()
  const [loading, setLoading] = useState<boolean>(false)
  
  const {data = null} = useQuery({
    queryKey: [{key: 'rewards'},poolId, account],
    enabled: !!poolId && !!account,
    queryFn: async () => {
      if (!poolId || !account) return null
      const result = await quote.getRewards({
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
      await quote.claim({chainId, poolId})
      message.success("Claim successfully claimed")
    } catch(e) {
      message.error(JSON.stringify(e))
    } finally {
      setLoading(false)
    }
    
  }, [chainId, poolId, account])
  return <div className="flex items-center gap-[20px]">
    <div className={'flex gap-[10px]'}>
      <span>Quote Rewards:</span>
      <span>{pool && data && formatUnits(data, pool?.quoteDecimals) + ` ${pool.quoteSymbol}`  || '--'}</span>
    </div>
    <Button label={'Claim'} disabled={disabled} isLoading={loading} onClick={onHandleClaim}/>
  </div>
}

