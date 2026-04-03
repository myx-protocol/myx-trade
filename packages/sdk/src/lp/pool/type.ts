import { ChainId } from "@/config/chain.js";

export interface CreatePoolRequest {
  chainId: ChainId;
  baseToken: `0x${string}`;
  marketId: string;
}
export enum PoolType {
  Base = 0,
  Quote = 1
}

export enum TriggerType {
  TP = 1,
  SL = 2,
}

export interface TpSl {
  amount: number;
  triggerPrice: number;
  triggerType: TriggerType;
}

export interface TpSLParams {
  amount: bigint;
  triggerPrice: bigint;
  triggerType: bigint;
  minQuoteOut: bigint;
}

export interface AddTpSLParams {
  slippage: number;
  chainId: ChainId;
  poolId: string;
  poolType: PoolType;
  tpsl: TpSl[]
}

export interface CancelTpSLParams {
  chainId: ChainId;
  orderId: string;
}
