import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { OnTickersCallback } from '@myx-trade/sdk'
import { useCallback, useRef } from 'react'
import { useMarketStore } from '../store/MarketStore'
import type { MarketTickerData } from '../store/MarketStore'
import { Count } from '@/utils/count'

const TICKER_DATA_UPDATE_TIMER = 500

interface subscribeTickerParams {
  globalId: number
  poolId: string
}

const tickerSubscriptionCountMap = new Map<number, Count>()

export const useSubscription = () => {
  const { client } = useMyxSdkClient()

  const marketStore = useMarketStore()
  const tickerDataUpdateTimerRef = useRef<Timeout | null>(null)
  const tickerDataTempRef = useRef<Record<string, MarketTickerData>>({})

  const subscribeToTicker = useCallback(
    (params: subscribeTickerParams | subscribeTickerParams[]) => {
      if (!client) return undefined
      if (Array.isArray(params) && !params.length) {
        return
      }
      if (!Array.isArray(params) && !params.poolId && !params.globalId) {
        return
      }
      const paramsList = (Array.isArray(params) ? params : [params]).filter((item) => {
        if (!item.poolId || !item.globalId) {
          return
        }
        return true
      })
      const globalIdList: Array<number> = []
      const globalIdMap: Map<number, string> = new Map()
      paramsList.forEach((item) => {
        if (globalIdMap.has(item.globalId)) {
          return
        }
        if (!tickerSubscriptionCountMap.has(item.globalId)) {
          tickerSubscriptionCountMap.set(item.globalId, new Count())
        }
        tickerSubscriptionCountMap.get(item.globalId)?.increment()
        globalIdList.push(item.globalId)
        globalIdMap.set(item.globalId, item.poolId)
      })
      if (!client.subscription.isConnected) {
        client.subscription.connect()
      }
      const onTickerUpdate: OnTickersCallback = (ticker) => {
        // cache ticker data
        const poolId = globalIdMap.get(ticker.globalId)
        if (!poolId) {
          return
        }
        tickerDataTempRef.current[poolId] = {
          price: ticker.data.p,
          change: ticker.data.C,
          high: ticker.data.h,
          low: ticker.data.l,
          volume: ticker.data.v,
          turnover: ticker.data.T,
        } as MarketTickerData
        // batch update ticker data
        if (tickerDataUpdateTimerRef.current === null) {
          tickerDataUpdateTimerRef.current = setTimeout(() => {
            // batch update ticker data
            marketStore.setTickerDataBatch(tickerDataTempRef.current)
            // reset timer
            tickerDataUpdateTimerRef.current = null
            // reset temp data
            tickerDataTempRef.current = {}
          }, TICKER_DATA_UPDATE_TIMER)
        }
      }

      console.log('subscribeTickers', globalIdList)
      client.subscription.subscribeTickers(globalIdList, onTickerUpdate)

      return () => {
        if (client.subscription.isConnected) {
          const removedPoolIdList: string[] = []
          globalIdList.forEach((globalId) => {
            tickerSubscriptionCountMap.get(globalId)?.decrement()
            if (tickerSubscriptionCountMap.get(globalId)?.valueOf() === 0) {
              tickerSubscriptionCountMap.delete(globalId)
              removedPoolIdList.push(globalIdMap.get(globalId) as string)
              // delete ticker data temp data
            }
          })
          if (removedPoolIdList.length) {
            marketStore.removeTickerDataBatch(removedPoolIdList)
            console.log(
              'delete ticker data',
              removedPoolIdList,
              useMarketStore.getState().tickerData,
            )
          }
          client.subscription.unsubscribeTickers(globalIdList, onTickerUpdate)
        }
      }
    },
    [client],
  )

  return {
    subscribeToTicker,
  }
}
