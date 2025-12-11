import { create } from 'zustand'
import { AmountUnitEnum, PositionActionEnum, TpSlTypeEnum } from '../../type'
import { Direction, OrderType } from '@myx-trade/sdk'

export interface TradePanelStore {
  /**
   * position action
   */
  positionAction: PositionActionEnum
  setPositionAction: (positionAction: PositionActionEnum) => void

  /**
   * order type
   */
  orderType: OrderType
  setOrderType: (orderType: OrderType) => void

  /**
   * auto margin mode
   */
  autoMarginMode: boolean
  setAutoMarginMode: (autoMarginMode: boolean) => void

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

  /**
   * price
   */
  price: string
  setPrice: (price: string) => void

  /**
   * collateralAmount amount
   */
  collateralAmount: string
  setCollateralAmount: (collateralAmount: string) => void
  /**
   * long size
   */
  longSize: string
  setLongSize: (longSize: string) => void
  /**
   * short size
   */
  shortSize: string
  setShortSize: (shortSize: string) => void
  /**
   * amountUnit
   */
  amountUnit: string
  setAmountUnit: (amountUnit: AmountUnitEnum) => void

  /**
   * chain id
   */
  receiveDialogOpen: boolean
  setReceiveDialogOpen: (receiveDialogOpen: boolean) => void

  amountSliderValue: number
  setAmountSliderValue: (amountSliderValue: number) => void
  /**
   * reset store
   */
  resetStore: () => void

  tempInputValue: string
  setTempInputValue: (tempInputValue: string) => void
}

export const useTradePanelStore = create<TradePanelStore>((set) => ({
  positionAction: PositionActionEnum.OPEN,
  setPositionAction: (positionAction: PositionActionEnum) => set({ positionAction }),

  orderType: OrderType.MARKET,
  setOrderType: (orderType: OrderType) => set({ orderType }),

  autoMarginMode: true,
  setAutoMarginMode: (autoMarginMode: boolean) => set({ autoMarginMode }),
  price: '0',
  setPrice: (price: string) => set({ price }),
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
  collateralAmount: '0',
  setCollateralAmount: (collateralAmount: string) => set({ collateralAmount }),
  longSize: '0',
  setLongSize: (longSize: string) => set({ longSize }),
  shortSize: '0',
  setShortSize: (shortSize: string) => set({ shortSize }),
  amountUnit: AmountUnitEnum.BASE,
  setAmountUnit: (amountUnit: AmountUnitEnum) => set({ amountUnit }),
  receiveDialogOpen: false,
  setReceiveDialogOpen: (receiveDialogOpen: boolean) => set({ receiveDialogOpen }),
  direction: Direction.LONG,
  amountSliderValue: 0,
  setAmountSliderValue: (amountSliderValue: number) => set({ amountSliderValue }),
  tempInputValue: '',
  setTempInputValue: (tempInputValue: string) => set({ tempInputValue }),
  resetStore: () =>
    set({
      amountSliderValue: 0,
      tempInputValue: '',
      longSize: '0',
      shortSize: '0',
    }),
}))
