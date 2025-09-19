import { md5 } from "@/crypto/md5";
import { WebSocketSubscriptionItem, WebSocketTopicEnum } from "./types";

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
