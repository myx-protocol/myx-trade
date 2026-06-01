import { SearchTypeEnum, SearchSecondTypeEnum, type SearchResultResponse } from '@myx-trade/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface OpenGlobalSearchParams {
  defaultTab?: SearchTypeEnum
  secondTab?: SearchSecondTypeEnum
}

interface GlobalSearchStore {
  isOpen: boolean
  open: (params?: OpenGlobalSearchParams) => void
  close: () => void

  isDropdownOpen: boolean
  openDropdown: (params?: OpenGlobalSearchParams) => void
  closeDropdown: () => void
  searchValue: string
  searchHistory: string[]
  setSearchValue: (value: string) => void
  setSearchHistory: (searchHistory: string[]) => void
  addSearchHistory: (value: string) => void
  clearSearchHistory: () => void

  searchTab: SearchTypeEnum
  setSearchTab: (tab: SearchTypeEnum) => void

  secondSearchTab: SearchSecondTypeEnum | 'all'
  setSecondSearchTab: (tab: SearchSecondTypeEnum | 'all') => void

  searchChainId: number | null
  setSearchChainId: (chainId: number | null) => void

  searchResult: SearchResultResponse | null
  setSearchResult: (searchResult: SearchResultResponse | null) => void
  searchLoading: boolean
  setSearchLoading: (loading: boolean) => void
}

export const useGlobalSearchStore = create<GlobalSearchStore>()(
  devtools(
    persist(
      immer((set) => ({
        isOpen: false,
        open: (params) => {
          const defaultTab = params?.defaultTab ?? SearchTypeEnum.Contract
          const secondTab = params?.secondTab ?? SearchSecondTypeEnum.BlueChips

          set((state) => {
            state.isOpen = true
            state.searchTab = defaultTab
            state.secondSearchTab = secondTab
            state.searchValue = ''

            return state
          })
        },
        close: () =>
          set((state) => {
            state.isOpen = false
            state.searchValue = ''
            return state
          }),

        isDropdownOpen: false,
        openDropdown: (params) => {
          const defaultTab = params?.defaultTab ?? SearchTypeEnum.Contract
          const secondTab = params?.secondTab ?? 'all'

          set((state) => {
            state.isDropdownOpen = true
            state.searchTab = defaultTab
            state.secondSearchTab = secondTab
            return state
          })
        },
        closeDropdown: () =>
          set((state) => {
            state.isDropdownOpen = false
            state.searchValue = ''
            return state
          }),
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

        secondSearchTab: 'all',
        setSecondSearchTab: (tab) => set({ secondSearchTab: tab }),

        searchChainId: null,
        setSearchChainId: (chainId: number | null) => set({ searchChainId: chainId }),

        searchResult: null,
        setSearchResult: (searchResult: SearchResultResponse | null) => set({ searchResult }),
        searchLoading: false,
        setSearchLoading: (loading: boolean) => set({ searchLoading: loading }),
      })),

      {
        name: 'global-search',
        partialize: (state) => ({
          searchHistory: state.searchHistory,
        }),
      },
    ),
  ),
)
