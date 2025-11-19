import { CookType } from './type.ts'
import { createContext } from 'react'
import type { MarketPool } from '@myx-trade/sdk'
import type { BaseLpDetail } from '@/request/lp/type.ts'

export interface CookContextValue {
  type: CookType
  setType: (type: CookType) => void
}

export const CookContext = createContext<CookContextValue>({} as CookContextValue)

export interface PoolContextValue {
  pool?: MarketPool
  chainId: number
  poolId: string
  price?: string
  baseLpDetail?: BaseLpDetail
}

export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue)

// export interface TrdeContextValue {
//   side:
// }
