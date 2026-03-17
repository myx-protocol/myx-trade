import { ChainId } from "@/config/chain.js";
import { OrderType, TriggerType, OperationType, Direction, TimeInForce } from "@/config/con.js";

/** Address string (ethers AddressLike compatible). */
export type AddressLike = string | `0x${string}`;

/** Minimal signer for params (ethers Signer / ISigner compatible). */
export type SignerLike = { getAddress(): Promise<string> };

export type UserFeeRateParams = {
  address: AddressLike;
  poolId: string;
  chainId: ChainId;
  singer: SignerLike;
}

export type PlaceOrderParams = {
  chainId: ChainId;
  address: AddressLike;
  poolId: string;
  positionId: number;
  orderType: OrderType;
  triggerType: TriggerType;
  operation: OperationType;
  direction: Direction;
  collateralAmount: string;
  size: string;
  orderPrice: string;
  triggerPrice: string;
  timeInForce: TimeInForce;
  postOnly: boolean;
  slippagePct: string;
  executionFeeToken: AddressLike;
  leverage: number;
  tpSize: string;
  tpPrice: string;
  slSize: string;
  slPrice: string;
}
