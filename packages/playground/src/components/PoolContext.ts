import { ChainId } from "@config/chain.ts";
import type { MarketInfo, MarketPool } from "@myx-trade/sdk";
import { createContext } from "react";

export interface PoolContextValue {
  poolId?: string;
  chainId: ChainId;
  account?: string;
  pools?: MarketPool[];
  setPoolId: (poolId: string) => void;
  refetch: () => void;
  isLoading: boolean;
  markets?: MarketInfo[];
  // setMarkets: (markets: MarketPool[]) => void;
  marketId?: string;
  setMarketId: (marketId: string) => void;
}
export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue);

export interface TpSlContextValue {
  tpAmount: number | string;
  setTpAmount: (value: number | string) => void;
  tpPrice: number | string;
  setTpPrice: (value: number | string) => void;
  slAmount: number | string;
  setSlAmount: (value: number | string) => void;
  slPrice: number | string;
  setSlPrice: (value: number | string) => void;
}

export const TpSlContext = createContext<TpSlContextValue>({} as TpSlContextValue);
