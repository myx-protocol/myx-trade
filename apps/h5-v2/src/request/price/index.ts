import { baseUrl, http } from '@/request'
import type { ChainId } from '@/config/chain.ts'
import type { PriceResponse } from '@/request/price/type.ts'

export const getOraclePrice = async (
  chainId: ChainId,
  poolIds: string[] = [],
): Promise<PriceResponse> => {
  if (poolIds.length) {
    return http.get(`${baseUrl}/openapi/gateway/quote/price/oracles`, {
      chainId,
      poolIds: poolIds.join(','),
    })
  }
  return Promise.reject(new Error('Invalid pool id'))
}
