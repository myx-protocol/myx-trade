/**
 * Trading related types and enums
 */

// Order Types
export const OrderType = {
  MARKET: 0, // Market order
  LIMIT: 1, // Limit order
  STOP: 2, // Stop order
  CONDITIONAL: 3, // Conditional order
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

// Trigger Types
export const TriggerType = {
  NONE: 0, // No trigger
  GTE: 1, // Greater than or equal (>=)
  LTE: 2, // Less than or equal (<=)
} as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

// Operation Types
export const OperationType = {
  INCREASE: 0, // Increase position
  DECREASE: 1, // Decrease position
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

// Direction
export const Direction = {
  LONG: 0, // Long
  SHORT: 1, // Short
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

// Time in Force
export const TimeInForce = {
  IOC: 0, // Immediate or cancel
} as const;
export type TimeInForce = (typeof TimeInForce)[keyof typeof TimeInForce];

// Trading position interface
export interface Position {
  positionId: string;
  poolId: string;
  direction: Direction;
  size: string;
  collateral: string;
  leverage: number;
  entryPrice: string;
  markPrice: string;
  pnl: string;
  unrealizedPnl: string;
  liquidationPrice: string;
  marginRatio: string;
  timestamp: number;
}

// Order interface
export interface Order {
  orderId: string;
  poolId: string;
  positionId: string;
  orderType: OrderType;
  triggerType: TriggerType;
  operation: OperationType;
  direction: Direction;
  size: string;
  collateralAmount: string;
  orderPrice?: string;
  triggerPrice?: string;
  timeInForce: TimeInForce;
  postOnly: boolean;
  slippagePct: string;
  leverage: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt: number;
}

// Order Status
export const OrderStatus = {
  PENDING: 0, // Pending
  PARTIAL: 1, // Partially filled
  FILLED: 2, // Fully filled
  CANCELLED: 3, // Cancelled
  REJECTED: 4, // Rejected
  EXPIRED: 5, // Expired
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

// Trading parameters for placing orders
export interface PlaceOrderParams {
  chainId: number;
  address: string;
  poolId: string;
  positionId: string;
  orderType: OrderType;
  triggerType: TriggerType;
  direction: Direction;
  collateralAmount: string;
  size: string;
  price: string;
  timeInForce: TimeInForce;
  postOnly: boolean;
  slippagePct: string;
  executionFeeToken: string;
  leverage: number;
  tpSize?: string;
  tpPrice?: string;
  slSize?: string;
  slPrice?: string;
}

export interface PositionTpSlOrderParams {
  chainId: number;
  address: string;
  poolId: string;
  positionId: string;
  executionFeeToken: string;
  tpTriggerType: TriggerType;
  slTriggerType: TriggerType;
  direction: Direction; // position direction
  leverage: number;
  tpSize?: string;
  tpPrice?: string;
  slSize?: string;
  slPrice?: string;
  slippagePct: string;
}
// Trading result
export interface TradingResult {
  success: boolean;
  orderId?: string;
  transactionHash: string;
  gasUsed?: string;
  error?: string;
}

export interface UpdateOrderTpSlParams {
  orderId: string;
  tpSize: string;
  tpPrice: string;
  slSize: string;
  slPrice: string;
  address: string;
  executionFeeToken: string;
}
