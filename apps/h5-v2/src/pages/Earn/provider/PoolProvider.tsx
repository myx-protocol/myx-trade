import { PoolContext } from '@/pages/Earn/context.ts'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { useParams } from 'react-router-dom'
import { type ReactNode } from 'react'
import { usePoolDetail } from '@/hooks/lp/usePoolDetail'
import { PoolType } from '@/request/type.ts'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { pool, poolInfo, genesisFeeRate, refetch, mode, lpDetail, poolInfoRefetch } =
    usePoolDetail(PoolType.quote)

  return (
    <PoolContext.Provider
      value={{
        chainId: Number(chainId),
        poolId: poolId as string,
        pool,
        price: poolInfo?.price,
        quoteLpDetail: lpDetail as QuoteLpDetail,
        refetch,
        genesisFeeRate,
        exchangeRate: poolInfo?.exchangeRate,
        mode,
        tvl: poolInfo?.tvl,
        poolInfoRefetch,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
