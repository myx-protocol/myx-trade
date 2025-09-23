import { md5 } from "@/crypto/md5";
import {
  KlineDataResponse,
  KlineResolution,
  NativeTickerData,
  TickersDataResponse,
  WebSocketMessageResponse,
  WebSocketMethodEnum,
  WebSocketSubscriptionItem,
  WebSocketTopicEnum,
} from "./types";

/**
 * generate listener id
 */
export const generateListenerId = <T extends WebSocketTopicEnum>(
  subscription: WebSocketSubscriptionItem<T>
): string => {
  const { topic, params } = subscription;

  switch (topic) {
    case WebSocketTopicEnum.Kline:
      return `${topic}.${params.globalId}_${params.resolution}`;
    case WebSocketTopicEnum.Ticker:
      return `${topic}.${params.globalId}`;
    case WebSocketTopicEnum.TickerAll:
    case WebSocketTopicEnum.Order:
    case WebSocketTopicEnum.Position:
      return topic;
    default:
      return md5(JSON.stringify({ topic, params }));
  }
};

/**
 * isAckMessageResponse
 */
export const isAckMessageResponse = ({ type }: WebSocketMessageResponse) => {
  return Boolean(
    type === WebSocketMethodEnum.Pong ||
      type === WebSocketMethodEnum.SignIn ||
      type === WebSocketMethodEnum.SubscribeV2 ||
      type === WebSocketMethodEnum.UnsubscribeV2 ||
      type === "ping" ||
      type === "pong"
  );
};

/**
 * parse topic from type
 */
export const parseTopicFromType = (type: string) => {
  switch (type) {
    case WebSocketTopicEnum.Order:
    case WebSocketTopicEnum.Position:
    case WebSocketTopicEnum.TickerAll:
      return type;
    default:
      const [topic] = type.split(".");
      return topic;
  }
};

/**
 * native message transform
 */
export const messageTransform = (data: WebSocketMessageResponse) => {
  const topic = parseTopicFromType(data.type);
  switch (topic) {
    /**
     * tickers
     */
    case WebSocketTopicEnum.Ticker: {
      const [, globalId = ""] = data.type.split(".");
      return {
        ...data,
        type: generateListenerId({
          topic: WebSocketTopicEnum.Ticker,
          params: { globalId: parseInt(globalId) },
        }),
        globalId: parseInt(globalId),
      } as TickersDataResponse;
    }
    /**
     * kline
     */
    case WebSocketTopicEnum.Kline: {
      const [, paramData = ""] = data.type.split(".");
      let [globalId, resolution] = paramData.split("_");

      return {
        ...data,
        type: generateListenerId({
          topic: WebSocketTopicEnum.Kline,
          params: {
            globalId: parseInt(globalId),
            resolution: resolution as KlineResolution,
          },
        }),
        globalId: parseInt(globalId),
        resolution: resolution,
      } as KlineDataResponse;
    }
  }

  return data;
};
