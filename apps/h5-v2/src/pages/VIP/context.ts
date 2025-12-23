import { createContext, useContext } from 'react'
import type { RiskLevelConfig, LevelConfig, VipInfoType, FeeConfig } from '@/request/vip/type.d'

export interface VIPContextValue {
  riskTier: number
  setRiskTier: (riskTier: number) => void
  userVipInfo?: VipInfoType
  levelList: LevelConfig[]
  riskList?: RiskLevelConfig[]
  isLoading?: boolean
  feeMap?: Record<string, FeeConfig>
  isFeeLoading?: boolean
}

export const VIPContext = createContext<VIPContextValue>({} as VIPContextValue)

export const useVipContext = () => useContext(VIPContext)
