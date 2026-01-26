import { type SeamlessState, seamlessState, type SeamlessAccount } from './initialState'
import { createWithEqualityFn } from 'zustand/traditional'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'

interface Action {
  setSeamlessAccountList: (seamlessAccountList: SeamlessAccount[]) => void
  setActiveSeamlessAddress: (activeSeamlessAddress: string) => void
  setSelectedSeamlessAddress: (selectedSeamlessAddress: string) => void
}

type SeamlessStore = SeamlessState & Action

export const useSeamlessStore = createWithEqualityFn<SeamlessStore>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            ...seamlessState,
            setSeamlessAccountList: (seamlessAccountList: SeamlessAccount[]) =>
              set({ seamlessAccountList }),
            setActiveSeamlessAddress: (activeSeamlessAddress: string) =>
              set({ activeSeamlessAddress }),
            setSelectedSeamlessAddress: (selectedSeamlessAddress: string) =>
              set({ selectedSeamlessAddress }),
          }) as SeamlessStore,
      ),
      {
        name: 'MYX_SeamlessStore',
        partialize: (state: SeamlessStore) => ({
          seamlessAccountList: state.seamlessAccountList,
          activeSeamlessAddress: state.activeSeamlessAddress,
        }),
      },
    ),
  ),
  shallow,
)
