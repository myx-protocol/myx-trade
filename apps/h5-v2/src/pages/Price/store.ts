import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export enum PriceTabEnum {
  Price = 'price',
  Info = 'info',
  Pool = 'pool',
}

interface PriceStore {
  tab: PriceTabEnum
  setTab: (tab: PriceTabEnum) => void
}

export const usePriceStore = create<PriceStore>()(
  devtools(
    immer((set) => ({
      tab: PriceTabEnum.Price,
      setTab: (tab) => set({ tab }),
    })),
  ),
)
