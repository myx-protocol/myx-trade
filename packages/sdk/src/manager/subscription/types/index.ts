import { KlineDataResponse, TickersDataResponse } from "../websocket/types.js";

export interface MyxSubscriptionOptions {}

// Re-export the response types
export type { TickersDataResponse, KlineDataResponse, KlineResolution } from "../websocket/types.js";

export type OnTickersCallback = (data: TickersDataResponse) => void;
export type OnKlineCallback = (data: KlineDataResponse) => void;
export type OnOrderCallback = (data: any) => void;
export type OnPositionCallback = (data: any) => void;
export type OnTickersAllCallback = (data: any) => void;
