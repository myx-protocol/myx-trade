import { type OrderState, orderState } from './initialState'
import { createWithEqualityFn } from 'zustand/traditional'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'

interface Action {
  setCancelOrderDialogOpen: (cancelOrderDialogOpen: boolean) => void
}

type OrderStore = OrderState & Action

export const useOrderStore = createWithEqualityFn<OrderStore>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            ...orderState,
            setCancelOrderDialogOpen: (cancelOrderDialogOpen: boolean) =>
              set({ cancelOrderDialogOpen }),
          }) as OrderStore,
      ),
      {
        name: 'MYX_OrderStore',
        partialize: () => ({
          // cancelOrderDialogOpen: state.cancelOrderDialogOpen,
        }),
      },
    ),
  ),
  shallow,
)
