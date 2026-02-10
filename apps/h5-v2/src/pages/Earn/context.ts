import { ChartInterval } from './type.ts'
import { createContext } from 'react'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { type MarketInfo, type MarketPool } from '@myx-trade/sdk'
import { Interval } from '@/request/type.ts'
import { Mode } from '@/pages/Cook/type.ts'

export interface ChartContextValue {
  period: ChartInterval
  setPeriod: (period: ChartInterval) => void
}

export const ChartContext = createContext<ChartContextValue>({} as ChartContextValue)

export interface PoolContextValue {
  pool?: MarketPool
  chainId: number
  poolId: string
  price?: string
  exchangeRate?: string
  quoteLpDetail?: QuoteLpDetail
  refetch: () => void
  genesisFeeRate?: string
  mode: Mode
  tvl?: {
    totalTvl: string
    baseTvl: string
    quoteTvl: string
  }
  poolInfoRefetch: () => void
  fundingRate?: string
  markets?: MarketInfo[]
}
export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue)

export interface SearchContextValue {
  chainId: number | undefined
  setChainId: (chainId: number | undefined) => void
  interval?: Interval
  setInterval: (interval: Interval) => void
}
export const SearchContext = createContext<SearchContextValue>({} as SearchContextValue)
