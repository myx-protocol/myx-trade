import type { KlineTypeEnum } from '@/components/Trade/Charts/type'
import mitt from 'mitt'

/**
 * trade page pubsub events
 */
type TradePagePubSubEvents = {
  'kline:type:change': KlineTypeEnum
  'kline:resolution:change': number | string
  'kline:ready': void
  'kline:show:study:panel': void
  'kline:show:setting:panel': void
  'kline:take:screenshot': void
  'kline:full:screen:toggle': void
  'global:search:update': void
}

export const tradePubSub = mitt<TradePagePubSubEvents>()

/**
 * app pubsub events
 */
type AppPubSubEvents = {
  'app:sdk:authenticated': void
}

export const appPubSub = mitt<AppPubSubEvents>()
