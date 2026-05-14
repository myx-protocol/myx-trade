import { createContext } from 'react'

export enum TradeSide {
  Subscribe = 1,
  Redeem,
  Claim,
}
export interface TradeContextValue {
  side: TradeSide
  setSide: (side: TradeSide) => void
}

export const TradeContext = createContext<TradeContextValue>({} as TradeContextValue)
