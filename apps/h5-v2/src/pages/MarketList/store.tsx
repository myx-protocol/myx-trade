import { SearchSecondTypeEnum } from '@myx-trade/sdk'
import { create } from 'zustand'

interface MarketPageStore {
  tab: SearchSecondTypeEnum
  setTab: (tab: SearchSecondTypeEnum) => void

  chainId: number
  setChainId: (chainId: number) => void
}

export const useMarketPageStore = create<MarketPageStore>((set) => ({
  tab: SearchSecondTypeEnum.BlueChips,
  setTab: (tab: SearchSecondTypeEnum) => set({ tab }),
  chainId: 0,
  setChainId: (chainId: number) => set({ chainId }),
}))
