import { ChainId } from "@/config/chain";
import type { AddressLike } from "ethers/lib.esm";

export interface Deposit {
  chainId: ChainId,
  poolId: string;
  decimals?: number;
  // address: AddressLike;
  amount: number;
  slippage: number;
}


export interface WithdrawParams {
  chainId: ChainId;
  poolId: string;
  // lpAddress: string;
  // account?: AddressLike;
  amount:  number;
  // minAmount ?: string | number;
  slippage: number;
}

export interface previewAmountOutParams {
  chainId: ChainId;
  poolId: string;
  amountIn: bigint;
  price?: bigint;
}

export interface RewardsParams {
  chainId: ChainId;
  poolId: string;
  account: string;
}


export interface ClaimParams {
  chainId: ChainId;
  poolId: string;
}
