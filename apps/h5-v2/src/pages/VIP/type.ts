export interface VipProps {
  vipInfo?: VipInfoType
  isLoading?: boolean
  levelList?: { level: number; rule: LevelRule }[]
  rateList?: VipRateType[]
}
