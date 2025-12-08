import type { ResolutionString } from '@public/charting_library/charting_library'
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

  activeResolution: string
  setActiveResolution: (resolution: ResolutionString) => void
  fixedResolution: string
  setFixedResolution: (resolution: string) => void

  symbolInfo: MarketDetailResponse | null
  setSymbolInfo: (symbolInfo: MarketDetailResponse | null) => void
}

export const usePriceStore = create<PriceStore>()(
  devtools(
    persist(
      immer((set) => ({
        tab: PriceTabEnum.Price,
        setTab: (tab) => set({ tab }),

        activeResolution: '1h',
        setActiveResolution: (resolution) => set({ activeResolution: resolution }),

        fixedResolution: '1d',
        setFixedResolution: (resolution) => set({ fixedResolution: resolution }),

        symbolInfo: null,
        setSymbolInfo: (symbolInfo) => set({ symbolInfo }),
      })),
      {
        name: 'MYX_PriceStore',
        partialize: (state) => ({
          activeResolution: state.activeResolution,
          fixedResolution: state.fixedResolution,
        }),
      },
    ),
  ),
)
