import { immer } from 'zustand/middleware/immer'
import { createWithEqualityFn } from 'zustand/traditional'
import { CookOrderSideEnum } from './type'

interface ICookOrderStore {
  orderSide: CookOrderSideEnum
  setOrderSide: (orderSide: CookOrderSideEnum) => void

  slippage: string
  setSlippage: (slippage: string) => void

  retainGenesisLPShares: boolean
  setRetainGenesisLPShares: (value: boolean) => void
}

export const useCookOrderStore = createWithEqualityFn<ICookOrderStore>()(
  immer((set) => ({
    // order side
    orderSide: CookOrderSideEnum.Buy,
    setOrderSide: (orderSide: CookOrderSideEnum) => set({ orderSide }),

    // slippage
    slippage: '0.01',
    setSlippage: (slippage: string) => set({ slippage }),

    // retain genesis lp
    retainGenesisLPShares: true,
    setRetainGenesisLPShares(value) {
      set({
        retainGenesisLPShares: value,
      })
    },
  })),
)
