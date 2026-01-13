import type { PriceType, TickerDataItem } from '@myx-trade/sdk'
import { merge } from 'lodash-es'
import { create } from 'zustand'

export type MarketTickerData = Pick<
  TickerDataItem,
  'price' | 'change' | 'high' | 'low' | 'volume' | 'turnover'
>

interface MarketStore {
  /**
   * ticker data
   */
  tickerData: Record<string, MarketTickerData | undefined>
  setTickerData: (poolId: string, tickerData: MarketTickerData) => void
  setTickerDataBatch: (tickerData: Record<string, MarketTickerData>) => void
  removeTickerDataBatch: (poolIdList: string[]) => void

  // oracle price data
  watchOraclePoolIdMap: Map<number, Map<string, number>>
  setwatchOraclePoolIdMap: (chainId: number, poolId: string, isWatch: boolean) => void
  oraclePriceData: Record<string, PriceType>
  setOraclePriceData: (poolId: string, oraclePriceData: PriceType) => void
  setOraclePriceDataBatch: (oraclePriceData: Record<string, PriceType>) => void
}

export const useMarketStore = create<MarketStore>((set) => ({
  /**
   * ticker data
   */
  tickerData: {},
  setTickerData: (poolId, tickerData) =>
    set((state) => ({
      tickerData: merge(state.tickerData, { [poolId]: tickerData }),
    })),
  setTickerDataBatch: (tickerData) =>
    set((state) => ({
      tickerData: merge(state.tickerData, tickerData),
    })),

  removeTickerDataBatch(poolIdList) {
    set((state) => {
      const newTickerData = { ...state.tickerData }
      poolIdList.forEach((poolId) => {
        newTickerData[poolId] = undefined
      })
      return {
        tickerData: newTickerData,
      }
    })
  },

  /**
   * oraclePriceData
   */
  oraclePriceData: {},
  setOraclePriceData: (poolId, oraclePriceData) =>
    set((state) => ({
      oraclePriceData: merge(state.oraclePriceData, { [poolId]: oraclePriceData }),
    })),
  setOraclePriceDataBatch: (oraclePriceData) =>
    set((state) => ({
      oraclePriceData: merge(state.oraclePriceData, oraclePriceData),
    })),

  watchOraclePoolIdMap: new Map(),
  setwatchOraclePoolIdMap: (chainId, poolId, isWatch) => {
    set((state) => {
      const chainIdMap = state.watchOraclePoolIdMap.get(chainId) || new Map()
      const countValue = chainIdMap.get(poolId) || 0
      const nextCountValue = isWatch ? countValue + 1 : countValue - 1
      chainIdMap.set(poolId, nextCountValue)
      if (nextCountValue <= 0) {
        chainIdMap.delete(poolId)
      }
      state.watchOraclePoolIdMap.set(chainId, chainIdMap)
      return {
        watchOraclePoolIdMap: new Map(state.watchOraclePoolIdMap),
      }
    })
  },
}))
