import type { SortOrder } from '@/components/Sort'
import { SearchSecondTypeEnum, type SearchResultContractItem } from '@myx-trade/sdk'
import { create } from 'zustand'

interface MarketPageStore {
  tab: SearchSecondTypeEnum
  setTab: (tab: SearchSecondTypeEnum) => void

  chainId: number
  setChainId: (chainId: number) => void

  sort: {
    by: keyof SearchResultContractItem | undefined
    direction: SortOrder
  }
  setSort: (sort: { by: keyof SearchResultContractItem | undefined; direction: SortOrder }) => void
}

export const useMarketPageStore = create<MarketPageStore>((set) => ({
  tab: SearchSecondTypeEnum.BlueChips,
  setTab: (tab: SearchSecondTypeEnum) => set({ tab }),
  chainId: 0,
  setChainId: (chainId: number) => set({ chainId }),
  sort: {
    by: undefined,
    direction: 'none',
  },
  setSort: (sort: { by: keyof SearchResultContractItem | undefined; direction: SortOrder }) =>
    set({ sort }),
}))
