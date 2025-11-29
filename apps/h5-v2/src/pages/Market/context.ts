import type { Token } from './type.ts'
import { createContext } from 'react'
import type { MarketInfo } from '@myx-trade/sdk'
import type { Asset } from '@/hooks/useWalletPortfolio.ts'

export interface TokenContextValue {
  token?: Asset
  setToken: (token: Token) => void
  market?: MarketInfo
  poolId?: string
  setPoolId: (poolId: string) => void
  quote?: Token
}

export const TokenContext = createContext<TokenContextValue>({} as TokenContextValue)
