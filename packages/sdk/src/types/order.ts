/**
 * Order related types and interfaces
 */

import { OrderType, TriggerType, OperationType, Direction, TimeInForce, OrderStatus } from './trading';

// Order creation parameters
export interface CreateOrderParams {
  poolId: string;
  orderType: OrderType;
  triggerType?: TriggerType;
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
  tpSize?: string;
  tpPrice?: string;
  slSize?: string;
  slPrice?: string;
}

// Order update parameters
export interface UpdateOrderParams {
  orderId: string;
  size?: string;
  orderPrice?: string;
  triggerPrice?: string;
  slippagePct?: string;
}

// Order cancellation parameters
export interface CancelOrderParams {
  orderId: string;
  reason?: string;
}

// Batch order operations
export interface BatchOrderParams {
  orderIds: string[];
}

// Order history query parameters
export interface OrderHistoryParams {
  poolId?: string;
  status?: OrderStatus;
  orderType?: OrderType;
  direction?: Direction;
  startTime?: number;
  endTime?: number;
  limit?: number;
  offset?: number;
}

// Order book entry
export interface OrderBookEntry {
  price: string;
  size: string;
  orders: number;
}

// Order book
export interface OrderBook {
  poolId: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

// Trade execution
export interface TradeExecution {
  executionId: string;
  orderId: string;
  price: string;
  size: string;
  fee: string;
  feeToken: string;
  side: Direction;
  timestamp: number;
}

// Order fill information
export interface OrderFill {
  orderId: string;
  fillId: string;
  price: string;
  size: string;
  filledSize: string;
  remainingSize: string;
  fee: string;
  feeRate: string;
  timestamp: number;
}

// Order validation result
export interface OrderValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Order estimation
export interface OrderEstimation {
  estimatedPrice: string;
  estimatedFee: string;
  estimatedSlippage: string;
  minimumReceived: string;
  priceImpact: string;
}
