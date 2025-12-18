import { baseUrl, http } from '@/request'
import { buildAccessHeaders } from '@/request/utils'
import type { ApiResponse } from './type'

/**
 * 所有 referrral 接口的公共参数
 */
export interface AccessParams {
  accessToken: string
  account: string
}

const withAccessHeaders = ({ accessToken, account }: AccessParams) =>
  buildAccessHeaders(accessToken, account)

// 返佣比例
export interface GetReferralRatioResponse {
  account: string
  maxRatio: number
  options: number[]
  invitationCode: number
  referrerRatio: number
  refereeRatio: number
}
export const getReferralRatio = async (access: AccessParams) => {
  return http.get<ApiResponse<GetReferralRatioResponse>>(
    `${baseUrl}/openapi/gateway/referral/ratio/get`,
    undefined,
    { headers: withAccessHeaders(access) },
  )
}

// 创建邀请码
export interface CreateInvitationCodeParams {
  flag: number // 0: 普通邀请码 1: 默认邀请码
  refereeRatio: number // 返还比例
  referrerRatio: number //返佣比例
  note: string //备注
}
export const createInvitationCode = async (
  payload: { referrerRatio: number; refereeRatio: number; note?: string },
  access: AccessParams,
) => {
  return http.post<ApiResponse<null>>(`${baseUrl}/openapi/gateway/referral/codes/create`, payload, {
    headers: withAccessHeaders(access),
  })
}

// 设置默认邀请码
export const setDefaultInvitationCode = async (params: { code: string }, access: AccessParams) => {
  return http.post<ApiResponse<null>>(
    `${baseUrl}/openapi/gateway/referral/codes/set-default`,
    params,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 绑定邀请码
export const bindRelationshipByCode = async (params: { code: string }, access: AccessParams) => {
  return http.post<ApiResponse<null>>(
    `${baseUrl}/openapi/gateway/referral/relationships/bind`,
    params,
    { headers: withAccessHeaders(access) },
  )
}

// 邀请码列表
export interface InvitationCodeType {
  referrer: string
  invitationCode: string
  note: string
  refereeRatio: number
  referrerRatio: number
  referees: number
  flag: number
}
export const listInvitationCodes = async (access: AccessParams) => {
  return http.get<ApiResponse<InvitationCodeType[]>>(
    `${baseUrl}/openapi/gateway/referral/codes/list`,
    undefined,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 用户返佣统计数据
export interface UserReferralStatisticsType {
  account: string
  claimedAmount: string
  referralRebate: string
  referrerRebate: string
  refereeRebate: string
  referees: number
}
export const getUserReferralStatistics = async (access: AccessParams) => {
  return http.get<ApiResponse<UserReferralStatisticsType>>(
    `${baseUrl}/openapi/gateway/referral/rebates/summary`,
    undefined,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 分链领取数量
export interface ReferralClaimCountByChainType {
  chainId: number
  account: string
  referralRebate: string
  referrerRebate: string
  refereeRebate: string
  claimedAmount: string
  unclaimedAmount: string
}
export const getReferralClaimCountByChain = async (access: AccessParams) => {
  return http.get<ApiResponse<ReferralClaimCountByChainType[]>>(
    `${baseUrl}/openapi/gateway/referral/unclaim/by-chain`,
    undefined,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 用户邀请人数据
export interface UserReferralDataType {
  id: number
  referee: string // 被邀请人
  invitationCode: string
  referrerRatio: number
  refereeRatio: number
  referralRebate: string
  referrerRebate: string
  createTime: number
  contribute: string
}

export interface GetUserReferralDataParams {
  code?: string
  after?: string | number
  before?: string | number
  limit?: number
}
export const getUserReferralData = async (
  params: GetUserReferralDataParams,
  access: AccessParams,
) => {
  return http.get<ApiResponse<UserReferralDataType[]>>(
    `${baseUrl}/openapi/gateway/referral/relationships/list`,
    params,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 被邀请人返佣统计
export interface RefereeReferralStatisticsParams {
  referee: string
}
export interface RefereeReferralStatisticsType {
  referee: string
  h24: string
  d7: string
  d30: string
}
export const getRefereeReferralStatistics = async (
  params: RefereeReferralStatisticsParams,
  access: AccessParams,
) => {
  return http.get<ApiResponse<RefereeReferralStatisticsType>>(
    `${baseUrl}/openapi/gateway/referral/rebates/by-referee`,
    params,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 被邀请人返佣流水
export interface RefereeReferralFlowType {
  id: string
  account: string
  chainId: number
  receiveAmount: string //返佣数量
  rebateType: 1 | 2 // 1=返佣, 2=返还
  txTime: number // 返佣时间
}
interface GetRefereeReferralFlowParams {
  after: number
  before: number
  limit: number
}
export const getRefereeReferralFlow = async (
  params: GetRefereeReferralFlowParams,
  access: AccessParams,
) => {
  return http.get<ApiResponse<RefereeReferralFlowType[]>>(
    `${baseUrl}/openapi/gateway/referral/rebates/list`,
    params,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 提取返佣流水
export interface ExtractReferralFlowType {
  account: string
  chainId: number
  claimAmount: string //提取数量
  txHash: string // 交易哈希
  txTime: number // 提取时间
}
export interface ExtractReferralFlowParams {
  after: number
  before: number
  limit: number
}
export const extractReferralFlow = async (
  params: ExtractReferralFlowParams,
  access: AccessParams,
) => {
  return http.get<ApiResponse<ExtractReferralFlowType[]>>(
    `${baseUrl}/openapi/gateway/referral/claims/list`,
    params,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 领取滚动列表
export interface ClaimNoticeListParams {
  limit?: number // 限制数量
}
export interface ClaimNoticeListType {
  account: string
  claimAmount: string //提取数量
}
export const getClaimNoticeList = async (params: ClaimNoticeListParams, access: AccessParams) => {
  return http.get<ApiResponse<ClaimNoticeListType[]>>(
    `${baseUrl}/openapi/gateway/referral/claims/top`,
    params,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// 更新备注
export const updateInvitationNote = async (code: string, note: string, access: AccessParams) => {
  // TODO: 确认后端实际 path
  return http.post(
    `${baseUrl}/openapi/gateway/referral/codes/set-note`,
    { code, note },
    { headers: withAccessHeaders(access) },
  )
}

// 获取配置信息
export interface ReferralConfigType {
  maxVipLevel: number
  codeCount: number
  remindLine: number
}
export const getReferralConfig = async (access: AccessParams) => {
  return http.get<ApiResponse<ReferralConfigType>>(`${baseUrl}/v2/ref/config`, undefined, {
    headers: withAccessHeaders(access),
  })
}

export interface StatisticsType {
  h24: string
  d7: string
  d30: string
  vipTier: number
  referee: string
}

// 获取统计详情
export const getStaticDetail = async (referee: string, access: AccessParams) => {
  return http.get<StatisticsType>(
    `${baseUrl}/openapi/gateway/referral/rebates/by-referee`,
    { referee },
    { headers: withAccessHeaders(access) },
  )
}

// 根据邀请码查询关系
export interface GetReferralByCodeParams {
  code: string
}
export interface GetReferralByCodeResponse {
  referrer: string
  refereeRatio: number
}
export const getReferralByCode = async (params: GetReferralByCodeParams, access: AccessParams) => {
  return http.get<ApiResponse<GetReferralByCodeResponse>>(
    `${baseUrl}/openapi/gateway/referral/codes/get`,
    params,
    { headers: withAccessHeaders(access) },
  )
}

// 获取推荐人信息
export const getReferrerInfo = async (access: AccessParams) => {
  return http.get<ApiResponse<GetReferralByCodeResponse>>(
    `${baseUrl}/openapi/gateway/referral/referrer`,
    undefined,
    {
      headers: withAccessHeaders(access),
    },
  )
}

// @todo 下面是v1的接口，现在已经废弃

// 邀请记录
export interface InviteType {
  id: string
  referee: string
  contribute: string
  createTime: number
  referrerRatio: number
  refereeRatio: number
}

export const listInvites = async (
  params: { code?: string; after?: string | number; before?: string | number; limit?: number },
  access: AccessParams,
) => {
  // TODO: 确认后端实际 path
  return http.get<InviteType[]>(`${baseUrl}/openapi/gateway/referral/invite/list`, params, {
    headers: withAccessHeaders(access),
  })
}
