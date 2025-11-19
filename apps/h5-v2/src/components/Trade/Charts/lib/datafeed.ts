import type { KlineDataResponse, KlineResolution, MyxClient } from '@myx-trade/sdk'
import type {
  IBasicDataFeed,
  LibrarySymbolInfo,
  Bar,
} from '@public/charting_library/charting_library'
import { useTradePageStore } from '../../store/TradePageStore'
import { resolution } from '../const'
type SymbolInfo = Omit<LibrarySymbolInfo, 'ticker'> & {
  ticker: string
}

export const formatResolutionToDisplayText = (resolution: string | number) => {
  if (Number.isNaN(Number(resolution))) {
    if (resolution.toString().includes('M')) {
      return resolution
    }
    return resolution.toString().toLocaleString()
  }
  const resolutionNumber = Number(resolution)
  if (resolutionNumber < 60) {
    return `${resolutionNumber}m`
  } else {
    return `${resolutionNumber / 60}h`
  }
}

export const translateResolutionToRequestParams = (resolution: string | number) => {
  const result = formatResolutionToDisplayText(resolution)
  if (result !== '1M') return result.toString().toLowerCase() as KlineResolution
  return result as KlineResolution
}

interface SubscribeCachedMap {
  unSubscribe: () => void
}

export const generateDataFeed = (client: MyxClient) => {
  if (!client) throw new Error('Client is required')
  const subscribeCachedMap = new Map<string, SubscribeCachedMap>()

  const dataFeedService: IBasicDataFeed = {
    onReady(callback: any) {
      setTimeout(() => {
        // `onReady` should return result asynchronously. Use `setTimeout` with 0 interval to execute the callback function.
        callback({
          exchanges: [],
          symbols_types: [],
          supports_time: false,
          supported_resolutions: resolution,
          supports_marks: false,
          supports_timescale_marks: false,
        })
      })
    },

    searchSymbols: async (
      // userInput: string,
      // exchange: string,
      // symbolType: string,
      onResultCallback: any,
    ) => {
      onResultCallback([])
    },

    resolveSymbol: async (_: string, onSymbolResolvedCallback: any) => {
      // const ticker = getSymbolTick(symbolName)

      const { priceScale = 2, baseVolScale = 2 } = {}

      const symbolInfo = useTradePageStore.getState().symbolInfo
      if (!symbolInfo) {
        return
      }

      // SymbolInfo validation: timezone must be non-empty string
      const data = {
        type: 'bitcoin',
        name: `${symbolInfo.baseSymbol}${symbolInfo.quoteSymbol}`,
        ticker: symbolInfo.poolId,
        has_intraday: true,
        has_weekly_and_monthly: true,
        session: '24x7',
        pricescale: 10 ** priceScale,
        volume_precision: baseVolScale,
        minmov: 1,
        timezone: 'Etc/UTC',
      }

      onSymbolResolvedCallback(data)
    },

    async getBars(
      symbolInfo: SymbolInfo,
      resolution: string,
      periodParams: any,
      onHistoryCallback,
      onErrorCallback: any,
    ) {
      const { from, to, countBack } = periodParams
      const max = 1000
      let lastBar: Bar | null = null
      let count = countBack
      const poolId = symbolInfo.ticker

      const Bars: Bar[] = []

      const setBars = async () => {
        const bars = await client?.markets.getKlineList({
          poolId,
          limit: count > max ? max : count,
          endTime: lastBar ? parseInt((lastBar?.time / 1000 - 60).toString()) : to,
          interval: translateResolutionToRequestParams(resolution),
        })
        if (bars && bars.length > 0) {
          count -= bars.length
          bars.forEach((bar) => {
            if (bar.time >= from && bar.time < to) {
              Bars.unshift({
                time: bar.time * 1000,
                low: +bar.low,
                high: +bar.high,
                open: +bar.open,
                close: +bar.close,
              })
            }
          })
          lastBar = Bars[0]
        } else {
          count = 0
          lastBar = null
        }
        if (count > 0) {
          await setBars()
        }
      }

      try {
        await setBars()
        onHistoryCallback(Bars, {
          noData: Bars.length === 0 ? true : false,
        })
      } catch (err) {
        count = 0
        lastBar = null
        onHistoryCallback([], {
          noData: true,
        })
        onErrorCallback()
        console.error(err)
      }
    },

    unsubscribeBars(subscribeUID: string) {
      const unSubscribe = subscribeCachedMap.get(subscribeUID)
      if (unSubscribe) {
        unSubscribe.unSubscribe()
        subscribeCachedMap.delete(subscribeUID)
      }
    },

    async subscribeBars(_, resolution: string, onRealtimeCallback: any, subscribeUID: string) {
      const storeSymbolInfo = useTradePageStore.getState().symbolInfo
      if (!storeSymbolInfo) {
        throw new Error('Symbol info is required')
      }
      const globalId = storeSymbolInfo?.globalId
      if (!globalId) {
        throw new Error('Global ID is required')
      }

      const resolutionParams = translateResolutionToRequestParams(resolution)
      const unSubscribe = subscribeCachedMap.get(subscribeUID)
      if (unSubscribe) {
        unSubscribe.unSubscribe()
        subscribeCachedMap.delete(subscribeUID)
      }

      const onDataCallback = (data: KlineDataResponse) => {
        const bar: Bar = {
          time: data.data.t * 1000,
          open: +data.data.o,
          high: +data.data.h,
          low: +data.data.l,
          close: +data.data.c,
          volume: +data.data.v,
        }

        onRealtimeCallback(bar)
      }

      client?.subscription.subscribeKline(globalId, resolutionParams, onDataCallback)

      subscribeCachedMap.set(subscribeUID, {
        unSubscribe: () => {
          client?.subscription.unsubscribeKline(globalId, resolutionParams, onDataCallback)
        },
      })
    },
  }
  return dataFeedService
}
