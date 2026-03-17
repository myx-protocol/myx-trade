import { ChainId } from "@/config/chain.js";
import { AddressLike, Signer } from "ethers";
import { OrderType, TriggerType, OperationType, Direction, TimeInForce } from "@/config/con.js";



export type UserFeeRateParams = {
  address: AddressLike;
  poolId: string;
  chainId: ChainId;
  singer: Signer;
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
  executionFeeToken:  AddressLike;
  leverage: number;
  tpSize: string;
  tpPrice: string;
  slSize: string;
  slPrice: string;
}
