import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { createWithEqualityFn } from 'zustand/traditional'
import type { MarketDetailResponse } from '@myx-trade/sdk'
import { KlineTypeEnum } from '../Charts/type'

interface TradePageStore {
  symbol: string
  setSymbol: (symbol: string) => void
  symbolInfo: MarketDetailResponse | null
  setSymbolInfo: (symbolInfo: MarketDetailResponse) => void

  // kline
  resolutionFixed: string | number
  setResolutionFixed: (resolutionFixed: string | number) => void
  resolutionActive: string | number
  setResolutionActive: (resolutionActive: string | number) => void
  klineType: KlineTypeEnum
  setKlineType: (klineType: KlineTypeEnum) => void
  maxLeverage: number
  setMaxLeverage: (maxLeverage: number) => void
}

export const useTradePageStore = createWithEqualityFn<TradePageStore>()(
  devtools(
    persist(
      immer((set) => ({
        symbol: 'BTCUSDT',
        setSymbol: (symbol: string) => set({ symbol }),
        symbolInfo: null,
        setSymbolInfo: (symbolInfo) => set({ symbolInfo }),

        /**
         * kline resolution fixed
         */
        resolutionFixed: '1d',
        setResolutionFixed: (resolutionFixed: string | number) => set({ resolutionFixed }),
        resolutionActive: '1d',
        setResolutionActive: (resolutionActive: string | number) => set({ resolutionActive }),

        klineType: KlineTypeEnum.Candle,
        setKlineType: (klineType: KlineTypeEnum) => set({ klineType }),
        maxLeverage: 100,
        setMaxLeverage: (maxLeverage: number) => set({ maxLeverage }),
      })),
      {
        name: 'MYX_TradePageStore',
        partialize: (state: TradePageStore) => ({
          symbol: state.symbol,
          resolutionFixed: state.resolutionFixed,
          resolutionActive: state.resolutionActive,
          klineType: state.klineType,
        }),
      },
    ),
  ),
)
