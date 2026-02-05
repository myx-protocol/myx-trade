import { PoolContext } from '@/pages/Earn/context.ts'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { useParams } from 'react-router-dom'
import { type ReactNode, useEffect } from 'react'
import { usePoolDetail } from '@/hooks/lp/usePoolDetail.ts'
import { PoolType } from '@/request/type.ts'
import { t } from '@lingui/core/macro'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { pool, poolInfo, genesisFeeRate, refetch, lpDetail, poolInfoRefetch, mode, fundingRate } =
    usePoolDetail(PoolType.quote)

  useEffect(() => {
    document.title = t`${lpDetail?.mQuoteBaseSymbol || ''} | Stable Earn | MYX`
  }, [lpDetail])
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
        tvl: poolInfo?.tvl,
        poolInfoRefetch,
        mode,
        fundingRate: fundingRate?.nextFundingRatePercent,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
