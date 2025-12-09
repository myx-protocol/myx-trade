import { baseUrl } from '@/request'
import { http } from '@/request/http'
import type { ApiResponse } from './type'
import { useQuery } from '@tanstack/react-query'
import Big from 'big.js'

export const getAccessToken = async (
  appId: string,
  timestamp: number,
  expireTime: number,
  allowAccount: string,
  signature: string,
) => {
  try {
    const res = await http.get(
      `${baseUrl}/openapi/gateway/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`,
    )
    return {
      code: 0,
      msg: null,
      data: {
        accessToken: res.data.accessToken,
        expireAt: res.data.expireAt,
        allowAccount: res.data.allowAccount,
        appId: appId,
      },
    }
  } catch (error) {
    console.error('getAccessToken error-->', error)
    return {
      code: -1,
      msg: 'getAccessToken error',
      data: {
        accessToken: '',
        expireAt: 0,
        allowAccount: '',
        appId: '',
      },
    }
  }
}

export const getPoolLevelConfig = async (poolId: string, chainId: number) => {
  try {
    const res = await http.get(
      `${baseUrl}/openapi/gateway/risk/market_pool/level_config?poolId=${poolId}&chainId=${chainId}`,
    )
    return {
      code: 0,
      msg: null,
      data: res.data,
    }
  } catch (error) {
    console.error('getAccessToken error-->', error)
    return {
      code: -1,
      msg: 'getPoolLevelConfig error',
      data: null,
    }
  }
}

export const getPools = async () => {
  try {
    const res = await http.get(`${baseUrl}/openapi/gateway/scan/market/list`)
    return {
      code: 0,
      msg: null,
      data: res.data,
    }
  } catch (error) {
    console.error('getPools error-->', error)
    return {
      code: -1,
      msg: 'getPools error',
      data: null,
    }
  }
}

interface GetSecurityInfoParams {
  chainId: number
  address: string
}

interface GetSecurityInfoResponse {
  is_mintable: '0' | '1'
  is_blacklisted: '0' | '1' // is blacklisted
  is_whitelisted: '0' | '1'
  buy_tax: '0' | '1' // buy tax
  sell_tax: '0' | '1' // sell tax
  top10_holders_percentage: string // top 10 holders percentage
  is_open_source: '0' | '1' // is open source
  is_proxy: '0' | '1' // is proxy
}

export const getSecurityInfo = async (
  params: GetSecurityInfoParams,
): Promise<ApiResponse<GetSecurityInfoResponse>> =>
  http.get(`${baseUrl}/openapi/gateway/scan/market/go-plus`, params)

export const useSecurityInfo = (params: GetSecurityInfoParams) => {
  return useQuery({
    queryKey: ['securityInfo', params],
    queryFn: async () => {
      const res = await getSecurityInfo(params)
      const validKeys = Object.keys(res.data).filter((key) => {
        const value = res.data[key as keyof GetSecurityInfoResponse]
        return value !== undefined && value !== null && value !== ''
      })
      const total = validKeys.length
      let dangerCount = 0
      for (let i = 0; i < validKeys.length; i++) {
        const key = validKeys[i] as keyof GetSecurityInfoResponse
        // top 10 holders percentage is greater than 0.5 is danger
        if (key === 'top10_holders_percentage') {
          if (Big(res.data[key]).gte(0.5)) {
            dangerCount++
          }
        } else if (key === 'is_open_source') {
          // open source is 0 is danger
          if (res.data[key] === '0') {
            dangerCount++
          }
        } else if (res.data[key] === '1') {
          // other is 1 is danger
          dangerCount++
        }
      }

      if (res.code === 9200) {
        return {
          ...res.data,
          count: total,
          security_count: total - dangerCount,
          danger_count: dangerCount,
        }
      } else {
        return {
          ...res.data,
          count: 0,
          security_count: 0,
          danger_count: 0,
        }
      }
    },
    enabled: !!params.address && !!params.chainId,
    refetchOnWindowFocus: false,
  })
}

export type LeaderboardTimeInterval = '10m' | '1h' | '4h' | '12h' | '24h'
export type LeaderboardSortField =
  | 'tvl'
  | 'volume'
  | 'tokenCreateTime'
  | 'topGainers'
  | 'topLosers'
  | 'marketCap'
export enum LeaderboardTypeEnum {
  Bluechip = 1,
  Alpha = 2,
}
interface GetLeaderboardParams {
  timeInterval?: LeaderboardTimeInterval
  chainId?: number // 0 is all chains
  sortField?: LeaderboardSortField
  type?: LeaderboardTypeEnum
}

export interface GetLeaderboardItem {
  baseQuoteSymbol: string
  basePrice: string
  priceChange: string
  chainId: number
  poolId: string
  tokenIcon: string
  globalId: number
}

export const getLeaderboard = async (params: GetLeaderboardParams) => {
  return http.get<ApiResponse<GetLeaderboardItem[]>>(
    `${baseUrl}/openapi/gateway/scan/market/leaderboard`,
    params,
  )
}
