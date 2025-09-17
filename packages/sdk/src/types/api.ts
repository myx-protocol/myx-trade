/**
 * API response types and interfaces
 */

// Base API response structure
export interface BaseApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
}

// API error response
export interface ApiErrorResponse {
  code: number;
  message: string;
  details?: string;
  timestamp: number;
}

// Pagination parameters
export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API request configuration
export interface ApiRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
}

// WebSocket message types
export const WSMessageType = {
  SUBSCRIBE: 'subscribe',
  UNSUBSCRIBE: 'unsubscribe',
  PRICE_UPDATE: 'price_update',
  ORDER_UPDATE: 'order_update',
  POSITION_UPDATE: 'position_update',
  TRADE_UPDATE: 'trade_update',
  ERROR: 'error',
  PING: 'ping',
  PONG: 'pong'
} as const;
export type WSMessageType = typeof WSMessageType[keyof typeof WSMessageType];

// WebSocket message structure
export interface WSMessage<T = any> {
  type: WSMessageType;
  channel?: string;
  data: T;
  timestamp: number;
}

// WebSocket subscription parameters
export interface WSSubscription {
  channel: string;
  poolId?: string;
  interval?: string;
  depth?: number;
}

// Price update message
export interface PriceUpdateMessage {
  poolId: string;
  price: string;
  change24h: string;
  volume24h: string;
  timestamp: number;
}

// Order update message
export interface OrderUpdateMessage {
  orderId: string;
  status: string;
  filledSize: string;
  remainingSize: string;
  avgPrice: string;
  timestamp: number;
}

// Position update message
export interface PositionUpdateMessage {
  positionId: string;
  size: string;
  collateral: string;
  markPrice: string;
  pnl: string;
  liquidationPrice: string;
  timestamp: number;
}

// Trade update message
export interface TradeUpdateMessage {
  tradeId: string;
  poolId: string;
  price: string;
  size: string;
  side: string;
  timestamp: number;
}

// API rate limit information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Health check response
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: number;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    blockchain: 'up' | 'down';
  };
}
