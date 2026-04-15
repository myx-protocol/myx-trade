import { MarketPoolState } from '../api';

export const  isNeedPrice = (state: number) => !(state === MarketPoolState.Cook || state === MarketPoolState.Boosted || state === MarketPoolState.Primed)
