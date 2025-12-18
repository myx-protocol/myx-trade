import { getSupportedChainIdsByEnv } from '@/config/chain'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface HomeStore {
  chainId: number
  setChainId: (chainId: number) => void
}

export const useHomeStore = create<HomeStore>()(
  devtools(
    persist(
      immer((set) => ({
        chainId: getSupportedChainIdsByEnv()[0],
        setChainId: (chainId) => set({ chainId }),
      })),
      {
        name: 'MYX_HOME_STORE',
        partialize: (state) => ({ chainId: state.chainId }),
      },
    ),
  ),
)
