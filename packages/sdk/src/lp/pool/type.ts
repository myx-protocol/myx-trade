import type { AddressLike } from "ethers";
import { ChainId } from "@/config/chain";

export interface CreatePoolRequest {
  chainId: ChainId;
  marketId?: string;
  baseToken: AddressLike;
}
export enum PoolType {
  Base = 1,
  Quote = 2
}

export enum TriggerType {
  GTE = 1,
  LTE = 2,
}

export interface TpSL {
  amount: bigint;
  triggerPrice: bigint;
  triggerType: TriggerType;
}

export interface TpSLParams {
  amount: bigint;
  triggerPrice: bigint;
  triggerType: TriggerType;
  minQuoteOut: bigint;
}

export interface AddTpSLParams {
  chainId: ChainId;
  poolId: string;
  poolType: PoolType;
  tpsl: TpSLParams[]
}
