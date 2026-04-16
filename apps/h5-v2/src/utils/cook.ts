import { MarketPoolState } from '@myx-trade/sdk'

export const isCookState = (state: number) => {
  return state === MarketPoolState.Cook || state === MarketPoolState.Boosted
}
