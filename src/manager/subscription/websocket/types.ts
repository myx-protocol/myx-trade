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
  error: unknown;
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

/**
 * @description Ticker Data
 */
export interface NativeTickerData {
  /**
   * Change
   */
  C: string; // change
  /**
   *  Timestamp
   */
  E: number; // timestamp
  /**
   * Turnover
   */
  T: string; //turnover
  /**
   * High Price
   */
  h: string; // high
  /**
   * Index Price
   */
  i: string; // index price
  /**
   * Low Price
   */
  l: string; // low
  /**
   * Latest Price
   */
  p: string; // price
  /**
   * Volume
   */
  v: string; // volume
}

/**
 * MYX Websocket Message Response
 */
export interface WebSocketMessageResponse<
  DataType = Record<string, any> | string
> {
  type: string;
  data: DataType;
}

/**
 * WebSocket Ack Message Response
 */
export interface WebSocketAckMessageResponse
  extends WebSocketMessageResponse<{
    code: number;
    msg: string;
  }> {}

/**
 * MyxTickersDataResponse
 */
export interface TickersDataResponse {
  /**
   * topic
   */
  type: WebSocketTopicEnum.Ticker;
  /**
   * globalId
   */
  globalId: number;
  /**
   * ticker data
   */
  data: NativeTickerData;
}

/**
 *  Kline Data
 */
export interface KlineData {
  /**
   * Timestamp
   */
  E: number;
  /**
   * Turnover
   */
  T: string;
  /**
   * Close Price
   */
  c: string;
  /**
   * High Price
   */
  h: string;
  /**
   * Low Price
   */
  l: string;
  /**
   * Open Price
   */
  o: string;
  /**
   * Timestamp
   */
  t: number;
  /**
   * Volume
   */
  v: string;
}

/**
 * Kline Data Response
 */
export interface KlineDataResponse {
  /**
   * topic
   */
  type: WebSocketTopicEnum.Kline;
  /**
   * globalId
   */
  globalId: number;

  /**
   * resolution
   */
  resolution: KlineResolution;
  /**
   */
  /**
   * kline data
   */
  data: KlineData;
}
