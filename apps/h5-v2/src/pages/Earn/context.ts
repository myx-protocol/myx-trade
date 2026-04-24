import { ChartInterval } from './type.ts'
import { createContext } from 'react'
import type { MarketPoolRiskLevelConfig, QuoteLpDetail } from '@/request/lp/type.ts'
import { type MarketInfo, type MarketPool } from '@myx-trade/sdk'
import { Interval } from '@/request/type.ts'
import { Mode } from '@/pages/Cook/type.ts'
import type { VaultTabsEnum } from './components/type.ts'

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
  riskLevelConfig?: MarketPoolRiskLevelConfig | null
}
export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue)

export interface SearchContextValue {
  chainId: number | undefined
  setChainId: (chainId: number | undefined) => void
  interval?: Interval
  setInterval: (interval: Interval) => void
  tabValue: VaultTabsEnum
  setTabValue: (tabValue: VaultTabsEnum) => void
}
export const SearchContext = createContext<SearchContextValue>({} as SearchContextValue)
