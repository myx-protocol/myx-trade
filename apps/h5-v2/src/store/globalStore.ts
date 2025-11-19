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

  exportSeamlessKeyDialogOpen: boolean
  setExportSeamlessKeyDialogOpen: (open: boolean) => void
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
            setExportSeamlessKeyDialogOpen: (open: boolean) =>
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
          }) as GlobalStore,
      ),
      {
        name: 'global-store',
        partialize: (state) => ({
          tradeMode: state.tradeMode,
        }),
      },
    ),
  ),
  shallow,
)

export default useGlobalStore
