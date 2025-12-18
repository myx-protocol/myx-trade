import { type ReactNode, useState } from 'react'
import { PoolContext } from '@/pages/Cook/context.ts'
import { useParams } from 'react-router-dom'

import type { BaseLpDetail } from '@/request/lp/type.ts'
import { usePoolDetail } from '@/hooks/lp/usePoolDetail.ts'
import { PoolType } from '@/request/type.ts'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { pool, poolInfo, mode, genesisFeeRate, refetch, lpDetail, poolInfoRefetch } =
    usePoolDetail(PoolType.base)
  const [refreshAssetKey, setRefreshAssetKey] = useState(Date.now())

  const refreshAsset = async () => {
    setRefreshAssetKey(Date.now())
  }

  return (
    <PoolContext.Provider
      value={{
        chainId: Number(chainId),
        poolId: poolId as string,
        pool,
        price: poolInfo?.price,
        baseLpDetail: lpDetail as BaseLpDetail,
        refetch,
        mode,
        genesisFeeRate,
        refreshAssetKey,
        refreshAsset,
        exchangeRate: poolInfo?.exchangeRate,
        tvl: poolInfo?.tvl,
        poolInfoRefetch,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
