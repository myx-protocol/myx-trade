import type { ResolutionString } from '@public/charting_library/charting_library'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface ChartsStore {
  activeResolution: string
  setActiveResolution: (resolution: ResolutionString) => void
  fixedResolution: string
  setFixedResolution: (resolution: string) => void
}

export const useChartsStore = create<ChartsStore>()(
  devtools(
    persist(
      immer((set) => ({
        activeResolution: '1h',
        setActiveResolution: (resolution) => set({ activeResolution: resolution }),

        fixedResolution: '1d',
        setFixedResolution: (resolution) => set({ fixedResolution: resolution }),
      })),
      {
        name: 'MYX_ChartsStore',
        partialize: (state) => ({
          activeResolution: state.activeResolution,
          fixedResolution: state.fixedResolution,
        }),
      },
    ),
  ),
)
