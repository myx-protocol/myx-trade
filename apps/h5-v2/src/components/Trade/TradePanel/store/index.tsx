import { create } from 'zustand'
import { AmountUnitEnum, PositionActionEnum, TpSlTypeEnum } from '../../type'
import { OrderType } from '@myx-trade/sdk'

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
  tpslOpen: boolean
  setTpslOpen: (tpslOpen: boolean) => void

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
  tpValue: number
  setTpValue: (tpValue: number) => void

  /**
   * sl value
   */
  slValue: number
  setSlValue: (slValue: number) => void

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
   * open position slippage
   */
  openPositionSlippage: number
  setOpenPositionSlippage: (openPositionSlippage: number) => void
  /**
   * close position slippage
   */
  closePositionSlippage: number
  setClosePositionSlippage: (closePositionSlippage: number) => void
  /**
   * tp sl slippage
   */
  tpSlSlippage: number
  setTpSlSlippage: (tpSlSlippage: number) => void

  /**
   * chain id
   */
  receiveDialogOpen: boolean
  setReceiveDialogOpen: (receiveDialogOpen: boolean) => void
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
  tpslOpen: false,
  setTpslOpen: (tpslOpen: boolean) => set({ tpslOpen }),

  tpType: TpSlTypeEnum.PRICE,
  setTpType: (tpType: TpSlTypeEnum) => set({ tpType }),

  slType: TpSlTypeEnum.PRICE,
  setSlType: (slType: TpSlTypeEnum) => set({ slType }),

  tpValue: 0,
  setTpValue: (tpValue: number) => set({ tpValue }),

  slValue: 0,
  setSlValue: (slValue: number) => set({ slValue }),
  collateralAmount: '0',
  setCollateralAmount: (collateralAmount: string) => set({ collateralAmount }),
  longSize: '0',
  setLongSize: (longSize: string) => set({ longSize }),
  shortSize: '0',
  setShortSize: (shortSize: string) => set({ shortSize }),
  amountUnit: AmountUnitEnum.BASE,
  setAmountUnit: (amountUnit: AmountUnitEnum) => set({ amountUnit }),
  openPositionSlippage: 0,
  setOpenPositionSlippage: (openPositionSlippage: number) => set({ openPositionSlippage }),
  closePositionSlippage: 0,
  setClosePositionSlippage: (closePositionSlippage: number) => set({ closePositionSlippage }),
  tpSlSlippage: 0,
  setTpSlSlippage: (tpSlSlippage: number) => set({ tpSlSlippage }),
  receiveDialogOpen: false,
  setReceiveDialogOpen: (receiveDialogOpen: boolean) => set({ receiveDialogOpen }),
}))
