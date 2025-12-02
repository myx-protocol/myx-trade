import { DEFAULT_LIMIT } from '@/request/index.ts'

export enum ErrorCode {
  SUCCESS = 9200,
  SUCCESS_ORIGIN = 0,
  IDENTITY_VERIFICATION_FAILED = 9401,
  PERMISSION_DENIED = 9403,
  NOT_EXIST = 9404,
  REQUEST_LIMIT = 9429,
  SERVICE_ERROR = 9500,
  MISS_REQUESTED_PARAMETER = 9900,
  INVALID_PARAMETER = 9901,
  NETWORK_ERROR = 'ERR_NETWORK',
}
export interface AccessTokenRequest {
  accessToken: string
}

export interface BaseResponse {
  code: ErrorCode
  msg: string | null
}
export type SortField =
  | 'progress'
  | 'marketCap'
  | 'liquidity'
  | 'holders'
  | 'tokenCreateTime'
  | 'priceChange'
export type SortOrder = 'asc' | 'desc'
export type TimeInterval = '10m' | '1h' | '4h' | '12h' | '24h'

export enum TrenchSortField {
  'priceChange' = 'lpPriceChange',
  'apr' = 'baseApr',
  'tvl' = 'baseTvl',
  'volume' = 'volume',
  'oi' = 'oi',
  'tokenCreateTime' = 'tokenCreateTime',
}

export type QuoteLPSortField =
  | 'priceChange'
  | 'quoteApr'
  | 'quoteTvl'
  | 'volume'
  | 'oi'
  | 'tokenCreateTime'

export interface FilterRequest {
  limit?: number
  sortField?: SortField
  sortOrder: SortOrder
}

export const baseFilter: FilterRequest = {
  limit: DEFAULT_LIMIT,
  sortOrder: 'desc',
}

export interface CookRequest extends FilterRequest {
  chainId?: number
  marketCapMin?: string
  marketCapMax?: string
  priceChangeMin?: string
  priceChangeMax?: string
  tokenCreateTimeMin?: number
  tokenCreateTimeMax?: number
  holdersMin?: string
  holdersMax?: string
  liquidityMin?: string
  liquidityMax?: string
}

export enum PageDirection {
  Next = 'next',
  Prev = 'prev',
}
export interface PageRequest {
  limit: number
  direction?: PageDirection
  cursor?: string
}

export enum PriceInterval {
  '10min' = 1,
  '1d' = 21,
}

export enum Interval {
  '10m' = '10m',
  '1h' = '1h',
  '4h' = '4h',
  '12h' = '12h',
  '24h' = '24h',
}

export enum PoolType {
  base,
  quote,
}

export type Address = `0x${string}`
