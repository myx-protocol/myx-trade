import type { Token } from './type.ts'
import { createContext } from 'react'
import type { MarketInfo } from '@myx-trade/sdk'

export interface TokenContextValue {
  token?: Token
  setToken: (token: Token) => void
  market?: MarketInfo
  poolId?: string
  setPoolId: (poolId: string) => void
  quote?: Token
}

export const TokenContext = createContext<TokenContextValue>({} as TokenContextValue)
