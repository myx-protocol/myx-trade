import {
  SearchTypeEnum,
  SearchSecondTypeEnum,
  type SearchResultResponse,
  type SearchResultContractItem,
} from '@myx-trade/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { SortOrder } from '@/components/Sort'

interface GlobalSearchStore {
  searchValue: string
  searchHistory: string[]
  setSearchValue: (value: string) => void
  setSearchHistory: (searchHistory: string[]) => void
  addSearchHistory: (value: string) => void
  clearSearchHistory: () => void

  searchTab: SearchTypeEnum
  setSearchTab: (tab: SearchTypeEnum) => void

  secondSearchTab: SearchSecondTypeEnum
  setSecondSearchTab: (tab: SearchSecondTypeEnum) => void

  searchChainId: number | null
  setSearchChainId: (chainId: number | null) => void

  searchResult: SearchResultResponse | null
  setSearchResult: (searchResult: SearchResultResponse | null) => void
  searchLoading: boolean
  setSearchLoading: (loading: boolean) => void

  sort: {
    by: keyof SearchResultContractItem | undefined
    direction: SortOrder
  }
  setSort: (sort: { by: keyof SearchResultContractItem | undefined; direction: SortOrder }) => void
}

export const useGlobalContractSearchStore = create<GlobalSearchStore>()(
  devtools(
    persist(
      immer((set) => ({
        searchValue: '',
        searchHistory: [],
        setSearchValue: (value: string) => set({ searchValue: value }),
        setSearchHistory: (searchHistory: string[]) => set({ searchHistory }),
        addSearchHistory: (value: string) =>
          set((state) => {
            // 去重并添加到最前面
            const filtered = state.searchHistory.filter((item) => item !== value)
            state.searchHistory = [value, ...filtered].slice(0, 10) // 只保留最近10条
          }),
        clearSearchHistory: () => set({ searchHistory: [] }),

        searchTab: SearchTypeEnum.Contract,
        setSearchTab: (tab: SearchTypeEnum) => set({ searchTab: tab }),

        secondSearchTab: SearchSecondTypeEnum.Favorite,
        setSecondSearchTab: (tab: SearchSecondTypeEnum) => set({ secondSearchTab: tab }),

        searchChainId: null,
        setSearchChainId: (chainId: number | null) => set({ searchChainId: chainId }),

        searchResult: null,
        setSearchResult: (searchResult: SearchResultResponse | null) => set({ searchResult }),
        searchLoading: false,
        setSearchLoading: (loading: boolean) => set({ searchLoading: loading }),

        sort: {
          by: undefined,
          direction: 'none',
        },
        setSort: (sort: { by: keyof SearchResultContractItem | undefined; direction: SortOrder }) =>
          set({ sort }),
      })),

      {
        name: 'global-contract-search',
        partialize: (state) => ({
          searchHistory: state.searchHistory,
        }),
      },
    ),
  ),
)
