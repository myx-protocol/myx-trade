import type { LevelRule, VipInfoType, VipRateType } from '@/request/vip/type.d'

export interface VipProps {
  vipInfo?: VipInfoType
  isLoading?: boolean
  levelList?: { level: number; rule: LevelRule }[]
  rateList?: VipRateType[]
  riskTier: number
}
