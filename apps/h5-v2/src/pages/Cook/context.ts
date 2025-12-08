import { CookListType, CookType, type FilterInputType, Mode } from './type.ts'
import { createContext, useMemo } from 'react'
import type { MarketPool } from '@myx-trade/sdk'
import type { BaseLpDetail } from '@/request/lp/type.ts'

export interface CookContextValue {
  type: CookType
  setType: (type: CookType) => void
  cookType: CookListType
  setCookType: (cookType: CookListType) => void

  age: FilterInputType
  mc: FilterInputType
  progress: FilterInputType
  change: FilterInputType
  liq: FilterInputType
  holders: FilterInputType

  setAge: (age: FilterInputType) => void
  setMC: (mc: FilterInputType) => void
  setProgress: (progress: FilterInputType) => void
  setChange: (change: FilterInputType) => void
  setLiq: (liq: FilterInputType) => void
  setHolders: (holders: FilterInputType) => void
}

export const CookContext = createContext<CookContextValue>({} as CookContextValue)

export interface PoolContextValue {
  pool?: MarketPool
  chainId: number
  poolId: string
  price?: string
  exchangeRate?: string
  baseLpDetail?: BaseLpDetail
  refetch: () => void
  mode: Mode
  genesisFeeRate?: string
  refreshAssetKey: number
  refreshAsset: () => void
}

export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue)

// export interface TrdeContextValue {
//   side:
// }
