import type { KlineTypeEnum } from '@/components/Trade/Charts/type'
import type {
  IChartingLibraryWidget,
  IChartWidgetApi,
} from '@public/charting_library/charting_library'
import mitt from 'mitt'

interface TradeSlippageChangeEvent {
  chainId: number
  poolId: string
}

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
  'place:order:success': void
  'trade:slippage:change': TradeSlippageChangeEvent
}

export const tradePubSub = mitt<TradePagePubSubEvents>()

/**
 * app pubsub events
 */
type AppPubSubEvents = {
  'app:sdk:authenticated': void
}

export const appPubSub = mitt<AppPubSubEvents>()

/**
 * kline pubsub events
 */
type KlinePubSubEvents = {
  'kline:type:change': KlineTypeEnum
  'kline:resolution:change': number | string
  'kline:ready': IChartingLibraryWidget
  'kline:show:study:panel': void
  'kline:show:setting:panel': void
  'kline:take:screenshot': void
  'kline:full:screen:toggle': void
}

export const klinePubSub = mitt<KlinePubSubEvents>()
