import type { BaseResponse } from '@/request/type.ts'
import type { MarketPoolState } from '@myx-trade/sdk'

export type DashboardType = {
  lpAsset: string
  cumTradeAmount: string
  cumEarnings: string
  accountCount: number
  positionAmount: string
  positionAmountRate: string | number
  accountCountRate: string | number
  tradeAmountRate: number | string
  lpAssetRate: string | number
  earningsRate: string | number
}

export interface StatDashBoardResponse extends BaseResponse {
  data: DashboardType
}
export const enum Interval {
  hour = 1,
  day = 21,
  month = 41,
}

export type MarketPool = {
  poolId: string
  marketId: string
  chainId: number
  baseSymbol: string
  quoteSymbol: string
  baseTokenIcon: string
  state: MarketPoolState
}

export interface MarketPoolResponse extends BaseResponse {
  data: MarketPool[]
}

export type TradeVolume = {
  chainId: number
  poolId: string
  time: number
  value: string
}
export interface TradeVolumeResponse extends BaseResponse {
  data: TradeVolume[]
}

export type StatPosition = {
  chainId: string
  poolId: string
  time: number
  longSize: string
  shortSize: string
  longAmount: string
  shortAmount: string
}
export interface StatPositionResponse extends BaseResponse {
  data: StatPosition[]
}

export type TradingFee = {
  chainId: number
  poolId: string
  time: number
  tradingFee: string
}
export interface TradingFeeResponse extends BaseResponse {
  data: TradingFee[]
}

export type TVL = {
  chainId: number
  poolId: string
  time: number
  tvl: string
}
export interface TVLResponse extends BaseResponse {
  data: TVL[]
}

export type StatisticData = {
  time: number
  value: string
}

export interface StatisticResponse extends BaseResponse {
  data: StatisticData[]
}
