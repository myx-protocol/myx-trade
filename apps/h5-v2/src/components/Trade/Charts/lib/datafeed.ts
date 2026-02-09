import type { KlineDataResponse, KlineResolution, MyxClient } from '@myx-trade/sdk'
import type {
  IBasicDataFeed,
  LibrarySymbolInfo,
  Bar,
} from '@public/charting_library/charting_library'
import { resolution } from '../const'
import { parseTradingViewSymbol } from '../TradingView/utils'
import { useMarketStore } from '../../store/MarketStore'
import { autoPriceDecimals, getSuperDecimalScale, isSuperDecimal } from '@/utils/number'
type SymbolInfo = Omit<LibrarySymbolInfo, 'ticker'> & {
  ticker: string
}

const TV_MIN_PRICE_DECIMALS = 12

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

    resolveSymbol: async (templateSymbol: string, onSymbolResolvedCallback: any) => {
      const { symbol, chainId, poolId } = parseTradingViewSymbol(templateSymbol)

      const symbolInfo = await client.markets.getMarketDetail({
        chainId: chainId,
        poolId: poolId,
      })

      if (!symbolInfo) return

      // get min base token decimals
      const baseTokenDecimals = Math.min(4, symbolInfo.baseDecimals)
      // price decimals default 4
      let priceDecimals = 4
      // market price from store
      let marketPrice = useMarketStore.getState().tickerData[symbolInfo.poolId]?.price ?? null
      // if market price is not found, fetch from server
      if (marketPrice === null && client) {
        const tickerData = await client.markets.getTickerList({
          poolIds: [symbolInfo.poolId],
          chainId: Number(symbolInfo.chainId),
        })
        if (tickerData && tickerData.length > 0 && tickerData[0].price) {
          marketPrice = tickerData[0].price
        }
      }
      // if market price is found, set price decimals
      if (marketPrice !== null) {
        // if market price is super decimal, set price decimals to super decimal scale
        if (isSuperDecimal(marketPrice)) {
          priceDecimals = getSuperDecimalScale(parseFloat(marketPrice))
        } else {
          // if market price is not super decimal, set price decimals to auto price decimals
          priceDecimals = autoPriceDecimals(parseFloat(marketPrice))
        }
      }
      // get min price decimals
      priceDecimals = Math.min(priceDecimals, TV_MIN_PRICE_DECIMALS)

      // SymbolInfo validation: timezone must be non-empty string
      const data = {
        type: 'bitcoin',
        name: symbol,
        ticker: templateSymbol,
        has_intraday: true,
        has_weekly_and_monthly: true,
        session: '24x7',
        pricescale: 10 ** priceDecimals,
        volume_precision: 10 ** baseTokenDecimals,
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

      const Bars: Bar[] = []
      const { chainId, poolId } = parseTradingViewSymbol(symbolInfo.ticker)

      const setBars = async () => {
        const bars = await client?.markets.getKlineList({
          poolId,
          limit: count > max ? max : count,
          endTime: lastBar ? parseInt((lastBar?.time / 1000 - 60).toString()) : to,
          interval: translateResolutionToRequestParams(resolution),
          chainId: chainId,
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

    async subscribeBars(
      symbolInfo,
      resolution: string,
      onRealtimeCallback: any,
      subscribeUID: string,
    ) {
      const { globalId } = parseTradingViewSymbol(symbolInfo.ticker as string)
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
