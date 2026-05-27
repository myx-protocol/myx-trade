import { immer } from 'zustand/middleware/immer'
import { createWithEqualityFn } from 'zustand/traditional'
import { CookOrderSideEnum } from './type'
import { TpSlTypeEnum } from '@/components/Trade/type.ts'

interface ICookOrderStore {
  orderSide: CookOrderSideEnum
  setOrderSide: (orderSide: CookOrderSideEnum) => void

  slippage: string
  setSlippage: (slippage: string) => void

  retainGenesisLPShares: boolean
  setRetainGenesisLPShares: (value: boolean) => void

  showPoolRiskWarningDialog: boolean
  setShowPoolRiskWarningDialog: (value: boolean) => void

  /**
   * tpsl open
   */
  tpSlOpen: boolean
  setTpSlOpen: (tpslOpen: boolean) => void

  /**
   * tp
   */
  tpType: TpSlTypeEnum
  setTpType: (tpType: TpSlTypeEnum) => void

  /**
   * sl type
   */
  slType: TpSlTypeEnum
  setSlType: (slType: TpSlTypeEnum) => void

  /**
   * tp value
   */
  tpValue: string
  setTpValue: (tpValue: string) => void

  /**
   * sl value
   */
  slValue: string
  setSlValue: (slValue: string) => void
}

export const useCookOrderStore = createWithEqualityFn<ICookOrderStore>()(
  immer((set) => ({
    // order side
    orderSide: CookOrderSideEnum.Buy,
    setOrderSide: (orderSide: CookOrderSideEnum) => set({ orderSide }),
    /**
     * tpsl
     */
    tpSlOpen: false,
    setTpSlOpen: (tpSlOpen: boolean) => set({ tpSlOpen }),

    tpType: TpSlTypeEnum.PRICE,
    setTpType: (tpType: TpSlTypeEnum) => set({ tpType }),

    slType: TpSlTypeEnum.PRICE,
    setSlType: (slType: TpSlTypeEnum) => set({ slType }),

    tpValue: '',
    setTpValue: (tpValue: string) => set({ tpValue }),

    slValue: '',
    setSlValue: (slValue: string) => set({ slValue }),

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

    showPoolRiskWarningDialog: true,
    setShowPoolRiskWarningDialog: (value: boolean) => {
      set({ showPoolRiskWarningDialog: value })
    },
  })),
)
