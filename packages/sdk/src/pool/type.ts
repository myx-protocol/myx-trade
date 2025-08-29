import type { AddressLike } from "ethers";
import { ChainId } from "@/config/chain";

export interface CreatePoolRequest {
  chainId: ChainId;
  marketId?: string;
  baseToken: AddressLike;
}
