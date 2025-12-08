import { ChartInterval, Mode } from './type.ts'
import { createContext } from 'react'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { ChainId, type MarketPool } from '@myx-trade/sdk'
import { Interval } from '@/request/type.ts'

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
}
export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue)

export interface SearchContextValue {
  chainId: number | undefined
  setChainId: (chainId: number | undefined) => void
  interval: Interval | undefined
  setInterval: (interval: Interval | undefined) => void
}
export const SearchContext = createContext<SearchContextValue>({} as SearchContextValue)
