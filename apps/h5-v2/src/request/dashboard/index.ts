import { baseUrl, http } from '@/request'
import { addQueryParams } from '../utils'
import type { StatisticResponse } from '@/request/dashboard/type.ts'

export const getTrenchTvl = async (chainId?: number): Promise<StatisticResponse> => {
  return await http.get(
    `${baseUrl}/openapi/gateway/scan/lp-asset/sum-base${addQueryParams({ chainId })}`,
  )
}

export const getTrenchTradeVolume = async (chainId?: number): Promise<StatisticResponse> => {
  return await http.get(
    `${baseUrl}/openapi/gateway/scan/trade-volume/sum${addQueryParams({ chainId })}`,
  )
}
