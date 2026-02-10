import { TrenchSortField } from '@/request/type.ts'
import { MarketPoolState } from '@myx-trade/sdk'

export enum CookType {
  Cook = 'cook',
  Trench = 'trench',
}
export enum CookListType {
  Sniper,
  New,
  Soon,
}
export type Token = {
  icon: string
  name: string
  label: string
  chainId: number
  address: string
  time?: number
  rating?: string
  progress?: string
  state?: MarketPoolState
}

export type TokenData = {
  mc?: string
  change?: string
  liq?: string
  time?: number
  holder?: number
}

export enum TrenchType {
  Gainers = TrenchSortField.priceChange,
  Latest = TrenchSortField.tokenCreateTime,
  APR = TrenchSortField.apr,
  Eligible = TrenchSortField.tvl,
}

export type FilterInputType = [string, string]

export enum DetailTabType {
  Price,
  Trade,
  Info,
}

export enum Mode {
  Rise,
  Fall,
}

export interface PoolInfo {
  price?: string
  exchangeRate?: string
  tvl?: {
    totalTvl: string
    baseTvl: string
    quoteTvl: string
  }
  fundingInfo?: {
    nextFundingRate: bigint
    lastFundingFeeTracker: bigint
    nextEpochTime: bigint
  }
}
