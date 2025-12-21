import { type BaseResponse } from '@/request/type.ts'

export type VipInfoType = {
  level: number
  ruleCompletion: Completion
  currentCompletion: Completion
  myxTokenAmount: string
  tradeAmountV1: string
  tradeAmountV2: string
  stakingAmount: string
}

export interface VipInfoResponse extends BaseResponse {
  data: VipInfoType
}

export enum LevelRelation {
  AND = 'and',
  OR = 'or',
}

export type LevelRule = {
  trade30Vol: string
  mlpDailyVol: string
  mlpMonthVol: string
  mlp30BuyVol: string
  relation: LevelRelation
  myxDaily?: string
}

export type LevelConfig = {
  // level: number
  // rule: string
  vipTier: number
  rule: LevelRule
}

export type FeeConfig = {
  // level: number
  // rule: string
  baseMakerFee: string
  baseTakerFee: string
  dataVersion: number
  makerFee: string
  specialMakerFee: string
  specialTakerFee: string
  specialVipTier: boolean
  takerFee: string
  vipTier: number
}

export interface LevelConfigResponse extends BaseResponse {
  data: {
    vipTier: number
    rule: string
  }[]
}

export interface FeeConfigResponse extends BaseResponse {
  data: FeeConfig[]
}

export type VipRateType = {
  chainId: number
  pairId: number
  level: number
  takerFeeRate: string
  makerFeeRate: string
}

export interface VipRateResponse extends BaseResponse {
  data: VipRateType[]
}

export type RebatesRecord = {
  id: number
  chainId: number
  tradeVol: string
  rebateVol: string
  token: string
  businessTime: number
}

export interface listRebatesRecordResponse extends BaseResponse {
  data: RebatesRecord[]
}

export type GetRebatesRecord = {
  id: number
  chainId: number
  amount: string
  token: string
  txHash: string
  businessTime: number
}

export interface listGetRebatesRecordResponse extends BaseResponse {
  data: GetRebatesRecord[]
}

export type RebateInfoType = {
  claimedAmount: string
  availableAmount: string
  rebateAmount: string
}

export interface RebateInfoResponse extends BaseResponse {
  data: RebateInfoType
}

export type fetchWaitRebateDetailType = {
  chainId: number
  claimedAmount: string
  availableAmount: string
  token: string
}

export interface fetchWaitRebateDetailResponse extends BaseResponse {
  data: fetchWaitRebateDetailType[]
}

export type RiskLevelConfig = {
  levelId: number
  name: string
  minOrderSizeUsd: string
  lockSeconds: number
  lockPriceRate: string
  lockLiquidity: string
  fundingFeeSeconds: number
  slip: string
  leverage: number
  maintainCollateralRate: string
  fundingFeeRate1: string
  fundingFeeRate1Max: string
  fundingFeeRate2: string
}
export interface RiskLevelConfigResponse extends BaseResponse {
  data: RiskLevelConfig[]
}
