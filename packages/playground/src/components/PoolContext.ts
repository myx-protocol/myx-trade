import { ChainId } from "@config/chain.ts";
import type { MarketPool } from "@myx-trade/sdk";
import { createContext } from "react";

export interface PoolContextValue {
  poolId?: string;
  chainId: ChainId;
  account?: string;
  pools?: MarketPool[];
  setPoolId: (poolId: string) => void;
  refetch: () => void;
  isLoading: boolean;
}
export const PoolContext = createContext<PoolContextValue>({} as PoolContextValue);
