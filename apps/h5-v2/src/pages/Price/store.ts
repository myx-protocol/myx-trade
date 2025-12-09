import type { MarketDetailResponse } from '@myx-trade/sdk'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export enum PriceTabEnum {
  Price = 'price',
  Info = 'info',
  Pool = 'pool',
}

interface PriceStore {
  tab: PriceTabEnum
  setTab: (tab: PriceTabEnum) => void

  symbolInfo: MarketDetailResponse | null
  setSymbolInfo: (symbolInfo: MarketDetailResponse | null) => void
}

export const usePriceStore = create<PriceStore>()(
  devtools(
    persist(
      immer((set) => ({
        tab: PriceTabEnum.Price,
        setTab: (tab) => set({ tab }),

        symbolInfo: null,
        setSymbolInfo: (symbolInfo) => set({ symbolInfo }),
      })),
      {
        name: 'MYX_PriceStore',
      },
    ),
  ),
)
