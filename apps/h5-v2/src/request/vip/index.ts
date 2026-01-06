import { baseUrl, http } from '@/request'
import type {
  FeeConfigResponse,
  LevelConfigResponse,
  RiskLevelConfigResponse,
  VipInfoResponse,
} from './type.d'
import type { BaseResponse } from '@/request/type.ts'
import type { ApiResponse } from '@/api/type'
import type { AccessParams } from '@/api/referrals'

export const fetchVipApiBaseUrl = () => {
  return `${baseUrl}/openapi/gateway/vip`
}

export const listVipLevel = async () => {
  const rs: LevelConfigResponse = await http.get(`${fetchVipApiBaseUrl()}/configs`)

  return rs
}

export const listFeeLevel = async (riskTier: number) => {
  const rs: FeeConfigResponse = await http.get(
    `${fetchVipApiBaseUrl()}/fee_configs?riskTier=${riskTier}`,
  )

  return rs
}

export const fetchVipInfo = async (account: string, accessToken: string) => {
  const rs: VipInfoResponse = await http.get(`${fetchVipApiBaseUrl()}/status`, undefined, {
    headers: {
      myx_openapi_access_token: accessToken,
      myx_openapi_account: account,
    },
  })

  return rs
}

export const getRiskLevelConfig = async (): Promise<RiskLevelConfigResponse> => {
  return await http.get(`${baseUrl}/openapi/gateway/risk/market_pool/level_configs`)
}

/**
 * redeem vip code
 */
interface RedeemRequest {
  code: string
}
export interface RedeemResponse {
  level: number
  startTime: number
  endTime: number
  state: number
  type: number
}
export const redeemVipCode = async (params: RedeemRequest, accessParams: AccessParams) => {
  return await http.post<ApiResponse<RedeemResponse>>(
    `${fetchVipApiBaseUrl()}/redeem/exchange`,
    params,
    {
      headers: {
        myx_openapi_access_token: accessParams.accessToken,
        myx_openapi_account: accessParams.account,
      },
    },
  )
}
