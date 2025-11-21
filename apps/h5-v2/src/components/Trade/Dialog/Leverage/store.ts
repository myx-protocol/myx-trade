import type { ChainId } from '@/config/chain'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { createWithEqualityFn } from 'zustand/traditional'

interface LeverageItem {
  leverage: number
}

interface LeverageDialogStore {
  leverageMap: Partial<Record<ChainId, Record<string, LeverageItem>>>
  setLeverage: (chainId: ChainId, poolId: string, leverage: number) => void
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useLeverageDialogStore = createWithEqualityFn<LeverageDialogStore>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            // dialog open state
            isOpen: false,
            open() {
              set({ isOpen: true })
            },
            close() {
              set({ isOpen: false })
            },
            // dialog leverage map
            leverageMap: {},
            setLeverage(chainId, poolId, leverage) {
              set((state) => {
                if (!state.leverageMap[chainId]) {
                  state.leverageMap[chainId] = {}
                }
                state.leverageMap[chainId][poolId] = { leverage }
              })
            },
          }) as LeverageDialogStore,
      ),
      {
        name: 'MYX_LeverageDialogStore',
        partialize: (state) => ({
          leverageMap: state.leverageMap,
        }),
      },
    ),
  ),
  shallow,
)
