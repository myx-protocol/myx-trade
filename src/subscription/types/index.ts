import { KlineDataResponse, TickersDataResponse } from "../websocket/types";

export interface MyxSubscriptionOptions {}

export type OnTickersCallback = (data: TickersDataResponse) => void;
export type OnKlineCallback = (data: KlineDataResponse) => void;
export type OnOrderCallback = (data: any) => void;
export type OnPositionCallback = (data: any) => void;
export type OnTickersAllCallback = (data: any) => void;
