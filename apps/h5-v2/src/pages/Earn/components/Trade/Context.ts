import { createContext } from 'react'

export enum TradeSide {
  Subscribe = 1,
  Redeem,
}
export interface TradeContextValue {
  side: TradeSide
  setSide: (side: TradeSide) => void
  slippage: string
  setSlippage: (slippage: string) => void
}

export const TradeContext = createContext<TradeContextValue>({} as TradeContextValue)
