import { create } from 'zustand'
import { TpSlTabTypeEnum } from '../types'

export interface PositionTPSLStore {
  tpSize: string
  setTpSize: (tpSize: string) => void
  slSize: string
  setSlSize: (slSize: string) => void
  activeTab: TpSlTabTypeEnum
  setActiveTab: (activeTab: TpSlTabTypeEnum) => void
  tpPrice: string
  setTpPrice: (tpPrice: string) => void
  slPrice: string
  setSlPrice: (slPrice: string) => void
  reset: () => void
}

export const usePositionTPSLStore = create<PositionTPSLStore>((set) => ({
  tpSize: '',
  setTpSize: (tpSize: string) => set({ tpSize }),
  slSize: '',
  setSlSize: (slSize: string) => set({ slSize }),
  tpPrice: '',
  setTpPrice: (tpPrice: string) => set({ tpPrice }),
  slPrice: '',
  setSlPrice: (slPrice: string) => set({ slPrice }),
  activeTab: TpSlTabTypeEnum.TPOrSL,
  setActiveTab: (activeTab: TpSlTabTypeEnum) => set({ activeTab }),
  reset: () => set({ tpSize: '', slSize: '', tpPrice: '', slPrice: '' }),
}))
