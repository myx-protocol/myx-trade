import { createWithEqualityFn } from 'zustand/traditional'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import { AVAILABLE_LOCALES, DEFAULT_LOCALE } from '@/locales/locale'
import { TradeMode } from '@/pages/Trade/types'

interface GlobalStore {
  theme: 'light' | 'dark'
  activeLocale: AVAILABLE_LOCALES
  setActiveLocale: (locale: AVAILABLE_LOCALES) => void
  changeModeDialogOpen: boolean
  setChangeModeDialogOpen: (open: boolean) => void
  tradeMode: TradeMode
  setTradeMode: (tradeMode: TradeMode) => void

  exportSeamlessKeyDialogOpen: string | false
  setExportSeamlessKeyDialogOpen: (open: string | false) => void
  exportSeamlessInfoDialogOpen: boolean
  setExportSeamlessInfoDialogOpen: (open: boolean) => void
  importSeamlessKeyDialogOpen: boolean
  setImportSeamlessKeyDialogOpen: (open: boolean) => void
  selectedSeamlessAccountDialogOpen: boolean
  setSelectedSeamlessAccountDialogOpen: (open: boolean) => void
  seamlessPasswordDialogOpen: boolean
  setSeamlessPasswordDialogOpen: (open: boolean) => void
  showSeamlessPasswordDialog: boolean
  setShowSeamlessPasswordDialog: (show: boolean) => void
  unlockAccountDialogOpen: boolean
  setUnlockAccountDialogOpen: (open: boolean) => void

  placeOrderConfirmDialogOpen: 'LONG' | 'SHORT' | false
  setPlaceOrderConfirmDialogOpen: (open: 'LONG' | 'SHORT' | false) => void

  closeOrderConfirmDialogOpen: 'LONG' | 'SHORT' | false
  setCloseOrderConfirmDialogOpen: (open: 'LONG' | 'SHORT' | false) => void

  showPlaceOrderConfirmDialog: boolean
  setShowPlaceOrderConfirmDialog: (show: boolean) => void

  showCloseOrderConfirmDialog: boolean
  setShowCloseOrderConfirmDialog: (show: boolean) => void

  marketCloseConfirmDialogOpen: boolean
  setMarketCloseConfirmDialogOpen: (open: boolean) => void

  setShowMarketCloseConfirmDialog: (show: boolean) => void
  showMarketCloseConfirmDialog: boolean

  accountDialogOpen: boolean
  setAccountDialogOpen: (open: boolean) => void
  poolList: any
  setPoolList: (list: any) => void
  userVipInfo: UserVipInfoContract | null
  setUserVipInfo: (userVipInfo: UserVipInfoContract | null) => void
}

interface UserVipInfoContract {
  tier: number
  referrer: string
  totalReferralRebatePct: number
  referrerRebatePct: number
  deadline: number
  nonce: number
}

const useGlobalStore = createWithEqualityFn<GlobalStore>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            theme: 'dark',
            activeLocale: DEFAULT_LOCALE,
            setActiveLocale: (locale: AVAILABLE_LOCALES) => set({ activeLocale: locale }),
            changeModeDialogOpen: false,
            setChangeModeDialogOpen: (open: boolean) => set({ changeModeDialogOpen: open }),
            tradeMode: TradeMode.Classic,
            setTradeMode: (tradeMode: TradeMode) => set({ tradeMode }),
            unlockAccountDialogOpen: false,
            setUnlockAccountDialogOpen: (open: boolean) => set({ unlockAccountDialogOpen: open }),
            seamlessPasswordDialogOpen: false,
            setSeamlessPasswordDialogOpen: (open: boolean) =>
              set({ seamlessPasswordDialogOpen: open }),
            showSeamlessPasswordDialog: false,
            setShowSeamlessPasswordDialog: (show: boolean) =>
              set({ showSeamlessPasswordDialog: show }),
            exportSeamlessKeyDialogOpen: false,
            setExportSeamlessKeyDialogOpen: (open: string | false) =>
              set({ exportSeamlessKeyDialogOpen: open }),
            exportSeamlessInfoDialogOpen: false,
            setExportSeamlessInfoDialogOpen: (open: boolean) =>
              set({ exportSeamlessInfoDialogOpen: open }),
            importSeamlessKeyDialogOpen: false,
            setImportSeamlessKeyDialogOpen: (open: boolean) =>
              set({ importSeamlessKeyDialogOpen: open }),
            selectedSeamlessAccountDialogOpen: false,
            setSelectedSeamlessAccountDialogOpen: (open: boolean) =>
              set({ selectedSeamlessAccountDialogOpen: open }),
            placeOrderConfirmDialogOpen: false,
            setPlaceOrderConfirmDialogOpen: (open: 'LONG' | 'SHORT' | false) =>
              set({ placeOrderConfirmDialogOpen: open }),
            showPlaceOrderConfirmDialog: false,
            setShowPlaceOrderConfirmDialog: (show: boolean) =>
              set({ showPlaceOrderConfirmDialog: show }),
            closeOrderConfirmDialogOpen: false,
            setCloseOrderConfirmDialogOpen: (open: 'LONG' | 'SHORT' | false) =>
              set({ closeOrderConfirmDialogOpen: open }),
            showCloseOrderConfirmDialog: false,
            setShowCloseOrderConfirmDialog: (show: boolean) =>
              set({ showCloseOrderConfirmDialog: show }),
            accountDialogOpen: false,
            setAccountDialogOpen: (open: boolean) => set({ accountDialogOpen: open }),
            poolList: [],
            setPoolList: (list: any[]) => set({ poolList: list }),
            userVipInfo: null,
            setUserVipInfo: (userVipInfo: UserVipInfoContract | null) => set({ userVipInfo }),
          }) as GlobalStore,
      ),
      {
        name: 'global-store',
        partialize: (state) => ({
          tradeMode: state.tradeMode,
          showPlaceOrderConfirmDialog: state.showPlaceOrderConfirmDialog,
          showCloseOrderConfirmDialog: state.showCloseOrderConfirmDialog,
        }),
      },
    ),
  ),
  shallow,
)

export default useGlobalStore
