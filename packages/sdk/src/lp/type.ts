import { ChainId } from "@/config/chain";

export interface Deposit {
  chainId: ChainId,
  poolId: string;
  decimals?: number;
  // address: AddressLike;
  amount: number;
}
