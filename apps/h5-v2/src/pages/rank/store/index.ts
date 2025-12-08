import { type LeaderboardSortField, type LeaderboardTimeInterval, LeaderboardTypeEnum } from '@/api'
import { create } from 'zustand'

interface RankStore {
  timeInterval: LeaderboardTimeInterval
  setTimeInterval: (timeInterval: LeaderboardTimeInterval) => void
  type: LeaderboardTypeEnum
  setType: (type: LeaderboardTypeEnum) => void
  tabsType: LeaderboardSortField
  setTabsType: (tabsType: LeaderboardSortField) => void
  chainId: number
  setChainId: (chainId: number) => void
}

export const useRankStore = create<RankStore>((set) => ({
  timeInterval: '10m',
  setTimeInterval: (timeInterval: LeaderboardTimeInterval) => set({ timeInterval }),
  type: LeaderboardTypeEnum.Bluechip,
  setType: (type: LeaderboardTypeEnum) => set({ type }),
  tabsType: 'tokenCreateTime',
  setTabsType: (tabsType: LeaderboardSortField) => set({ tabsType }),
  chainId: 0,
  setChainId: (chainId: number) => set({ chainId }),
}))
