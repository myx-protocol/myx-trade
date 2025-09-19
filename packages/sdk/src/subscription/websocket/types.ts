import ReconnectingWebSocket, {
  type Options as RWSOptions,
  type Event as RWSEvent,
} from "reconnecting-websocket";

export interface WebSocketConfig
  extends Omit<RWSOptions, "maxReconnectionDelay" | "minReconnectionDelay"> {
  url: string;
  debug?: boolean;
  protocols?: string | string[];
  // exponential backoff config
  initialReconnectDelay?: number; // initial reconnect delay (ms)
  maxReconnectDelay?: number; // max reconnect delay (ms)
  reconnectMultiplier?: number; // backoff multiplier
  maxReconnectAttempts?: number; // max reconnect attempts
  // message queue config
  maxEnqueuedMessages?: number; // max queued messages (default: 100)
  // request timeout config
  requestTimeout?: number; // request timeout (ms)
  // heartbeat config
  heartbeatInterval?: number; // heartbeat interval (ms)
  heartbeatMessage?: string; // heartbeat message
  noMessageTimeout?: number; // no message timeout (ms)
}

// event types
export interface WebSocketEvents extends Record<string | symbol, any> {
    open: RWSEvent;
    message: MessageEvent;
    close: CloseEvent;
    error: Event;
    reconnecting: { detail: number };
    maxreconnectattempts: void;
  }
  

/**
 * MYX WebSocket Topic Enum
 */
export enum WebSocketTopicEnum {
  Ticker = "ticker",
  TickerAll = "ticker.*",
  Kline = "candle",
  Order = "order",
  Position = "position",
}

/**
 * MYX WebSocket Method Enum
 */
export enum WebSocketMethodEnum {
  SignIn = "signin",
  Pong = "pong",
  SubscribeV2 = "subv2",
  UnsubscribeV2 = "unsubv2",
}

/**
 * MYX Kline Resolution
 */
export type KlineResolution =
  | "1m"
  | "5m"
  | "15m"
  | "30m"
  | "1h"
  | "4h"
  | "1d"
  | "1w"
  | "1M";

/**
 * MYX WebSocket Subscribe Params
 */
export type WebSocketSubscribeParams = {
  [WebSocketTopicEnum.Ticker]: {
    globalId: number;
  };
  [WebSocketTopicEnum.Kline]: {
    globalId: number;
    resolution: KlineResolution;
  };
};

/**
 * MYX WebSocket Subscription Item
 */
export type WebSocketSubscriptionItem<
  T extends WebSocketTopicEnum = WebSocketTopicEnum
> = T extends keyof WebSocketSubscribeParams
  ? {
      topic: T;
      params: WebSocketSubscribeParams[T];
    }
  : {
      topic: T;
      params?: never; // if topic is not defined in WebSocketSubscribeParams, params is optional and type is never
    };

/**
 * MYX WebSocket Request
 */
export interface WebSocketRequest {
  request: WebSocketMethodEnum;
  args: string[] | string;
}
