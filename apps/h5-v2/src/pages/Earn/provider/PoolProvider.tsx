import { PoolContext } from '@/pages/Earn/context.ts'
import { COMMON_PRICE_DECIMALS, formatUnits, quote as Quote, pool as Pool } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { getQuoteLPDetail } from '@/request'
import { useParams } from 'react-router-dom'
import type { ReactNode } from 'react'

export const PoolProvider = ({ children }: { children: ReactNode }) => {
  const { chainId, poolId } = useParams()
  const { data: quoteLpDetail, refetch } = useQuery({
    queryKey: [{ key: 'QuotePoolDetail' }, chainId, poolId],
    queryFn: async () => {
      if (!chainId || !poolId) return {} as QuoteLpDetail
      const response = await getQuoteLPDetail(chainId as unknown as number, poolId)
      if (response.data) {
        return response.data
      }
      return {} as QuoteLpDetail
    },
  })

  const { data: pool } = useQuery({
    queryKey: [{ key: 'pool_detail_by_poolId' }, poolId, chainId],
    queryFn: async () => {
      if (!poolId || !chainId) return undefined
      const result = await Pool.getPoolDetail(+chainId, poolId)

      return result
    },
  })

  const { data: price } = useQuery({
    queryKey: [{ key: 'getQuotePoolPrice' }, poolId, chainId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId || !chainId) return ''
      const result = await Quote.getLpPrice(+chainId, poolId)
      console.log(result)
      if (result) {
        return formatUnits(result, COMMON_PRICE_DECIMALS)
      }
      return ''
    },
    refetchInterval: 5000,
  })
  return (
    <PoolContext.Provider
      value={{
        chainId: Number(chainId),
        poolId: poolId as string,
        pool,
        price,
        quoteLpDetail,
        refetch,
      }}
    >
      {children}
    </PoolContext.Provider>
  )
}
