/**
 * Trading related types and enums
 */

// Order Types
export const OrderType = {
  MARKET: 0, // 市价单
  LIMIT: 1, // 限价单
  STOP: 2, // 止损单
  CONDITIONAL: 3, // 条件单
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

// Trigger Types
export const TriggerType = {
  NONE: 0, // 无触发
  GTE: 1, // 大于等于
  LTE: 2, // 小于等于
} as const;
export type TriggerType = (typeof TriggerType)[keyof typeof TriggerType];

// Operation Types
export const OperationType = {
  INCREASE: 0, // 增加仓位
  DECREASE: 1, // 减少仓位
} as const;
export type OperationType = (typeof OperationType)[keyof typeof OperationType];

// Direction
export const Direction = {
  LONG: 0, // 做多
  SHORT: 1, // 做空
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

// Time in Force
export const TimeInForce = {
  IOC: 0, // 立即执行或取消
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
  PENDING: 0, // 待处理
  PARTIAL: 1, // 部分成交
  FILLED: 2, // 完全成交
  CANCELLED: 3, // 已取消
  REJECTED: 4, // 已拒绝
  EXPIRED: 5, // 已过期
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
