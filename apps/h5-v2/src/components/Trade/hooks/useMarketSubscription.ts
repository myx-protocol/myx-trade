import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import type { OnTickersCallback } from '@myx-trade/sdk'
import { useCallback, useRef } from 'react'
import { useMarketStore } from '../store/MarketStore'
import type { MarketTickerData } from '../store/MarketStore'
import { Count } from '@/utils/count'

const TICKER_DATA_UPDATE_TIMER = 500
const UNSUBSCRIBE_DEBOUNCE_TIMER = 10000 // 防抖延迟时间，单位：毫秒

interface subscribeTickerParams {
  globalId: number
  poolId: string
}

const tickerSubscriptionCountMap = new Map<number, Count>()
const unsubscribeDebounceTimers = new Map<number, NodeJS.Timeout>() // 防抖定时器Map

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
        // 如果存在防抖定时器，说明之前准备删除但还没删除，现在重新订阅了，需要清除定时器
        const existingTimer = unsubscribeDebounceTimers.get(item.globalId)
        if (existingTimer) {
          clearTimeout(existingTimer)
          unsubscribeDebounceTimers.delete(item.globalId)
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

      client.subscription.subscribeTickers(globalIdList, onTickerUpdate)

      return () => {
        if (client.subscription.isConnected) {
          globalIdList.forEach((globalId) => {
            tickerSubscriptionCountMap.get(globalId)?.decrement()
            if (tickerSubscriptionCountMap.get(globalId)?.valueOf() === 0) {
              const poolId = globalIdMap.get(globalId) as string

              // 清除已存在的防抖定时器（如果有）
              const existingTimer = unsubscribeDebounceTimers.get(globalId)
              if (existingTimer) {
                clearTimeout(existingTimer)
              }

              // 设置防抖定时器，延迟删除数据
              const timer = setTimeout(() => {
                // 再次检查计数，确保仍然为0才删除
                if (tickerSubscriptionCountMap.get(globalId)?.valueOf() === 0) {
                  tickerSubscriptionCountMap.delete(globalId)
                  unsubscribeDebounceTimers.delete(globalId)
                  // 删除 ticker data
                  marketStore.removeTickerDataBatch([poolId])
                } else {
                  // 如果在延迟期间又重新订阅了，只清除定时器，不删除数据
                  unsubscribeDebounceTimers.delete(globalId)
                }
              }, UNSUBSCRIBE_DEBOUNCE_TIMER)

              unsubscribeDebounceTimers.set(globalId, timer)
            }
          })

          // 立即取消订阅（不再等待防抖），但数据延迟删除
          client.subscription.unsubscribeTickers(globalIdList, onTickerUpdate)
        }
      }
    },
    [client, marketStore],
  )

  return {
    subscribeToTicker,
  }
}
