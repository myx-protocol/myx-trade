import { ChainId } from "@/config/chain";
import type { TpSl } from "@/lp/pool";
import type { OracleType } from "@/api";
import type { BigNumberish, BytesLike } from "ethers/lib.esm";
export type DepositTpSl = Pick<TpSl, 'triggerType' | 'triggerPrice'>

export interface Deposit {
  chainId: ChainId,
  poolId: string;
  decimals?: number;
  // address: AddressLike;
  amount: number;
  slippage: number;
  tpsl?: DepositTpSl[]
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

export interface ClaimRebatesParams {
  chainId: ChainId;
  poolIds: string[];
}


export interface PreviewWithdrawDataParams {
  chainId: ChainId;
  poolId: string;
  account: string;
  amount: string | number;
}

export type OracleUpdatePrice =  { poolId: BytesLike;  oracleUpdateData: BytesLike; publishTime: BigNumberish; oracleType: OracleType }
