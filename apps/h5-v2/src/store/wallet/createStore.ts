import { type WalletState, walletState } from './initialState'
import { createWithEqualityFn } from 'zustand/traditional'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { shallow } from 'zustand/shallow'
import type { LoginChannel } from './types'

interface Action {
  setLoginModalOpen: (loginModalOpen: boolean) => void
  setActiveChainId: (activeChainId: number) => void
  setActiveAddress: (activeAddress: string) => void
  setLoginChannel: (loginChannel: LoginChannel) => void
  setRecentLoginType: (recentLoginType: string | undefined) => void
  setMoreLoginDrawerOpen: (moreLoginDrawerOpen: boolean) => void
}

type WalletStore = WalletState & Action

export const useWalletStore = createWithEqualityFn<WalletStore>()(
  devtools(
    persist(
      immer(
        (set) =>
          ({
            ...walletState,
            setLoginModalOpen: (loginModalOpen: boolean) => set({ loginModalOpen }),
            setActiveChainId: (activeChainId: number) => set({ activeChainId }),
            setActiveAddress: (activeAddress: string) => set({ activeAddress }),
            setLoginChannel: (loginChannel: LoginChannel) => set({ loginChannel }),
            setRecentLoginType: (recentLoginType: string | undefined) => set({ recentLoginType }),
            setMoreLoginDrawerOpen: (moreLoginDrawerOpen: boolean) => set({ moreLoginDrawerOpen }),
          }) as WalletStore,
      ),
      {
        name: 'MYX_WalletStore',
        partialize: (state: WalletState) => ({
          activeChainId: state.activeChainId,
          recentLoginType: state.recentLoginType,
        }),
      },
    ),
  ),
  shallow,
)
