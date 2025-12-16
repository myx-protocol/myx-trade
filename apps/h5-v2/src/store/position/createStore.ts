import { type PositionState, positionState } from './initialState'
import { createWithEqualityFn } from 'zustand/traditional'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'

interface Action {
  setHideOthersSymbols: (hideOthersSymbols: boolean) => void
  setSelectChainId: (selectChainId: string) => void
  setCloseAllPositionDialogOpen: (closeAllPositionDialogOpen: boolean) => void
  setCancelAllOrdersDialogOpen: (cancelAllOrdersDialogOpen: boolean) => void
}

type PositionStore = PositionState & Action

export const usePositionStore = createWithEqualityFn<PositionStore>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            ...positionState,
            setHideOthersSymbols: (hideOthersSymbols: boolean) => set({ hideOthersSymbols }),
            setSelectChainId: (selectChainId) => set({ selectChainId }),
            setCloseAllPositionDialogOpen: (closeAllPositionDialogOpen: boolean) =>
              set({ closeAllPositionDialogOpen }),
            setCancelAllOrdersDialogOpen: (cancelAllOrdersDialogOpen: boolean) =>
              set({ cancelAllOrdersDialogOpen }),
          }) as PositionStore,
      ),
      {
        name: 'MYX_PositionStore',
        // partialize: (state: PositionStore) => ({
        //   // activeLocale: state.activeLocale,

        // })
      },
    ),
  ),
  shallow,
)
