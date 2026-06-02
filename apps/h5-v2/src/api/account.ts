import { baseUrl, http } from '@/request'
import { buildAccessHeaders } from '@/request/utils'
import type { AccessParams, ApiResponse } from './type'
import type { VipInfoByBackend } from '@/types/vip'

/**
 * 所有 account 接口的公共参数
 */

const withAccessHeaders = ({ accessToken, account }: AccessParams) =>
  buildAccessHeaders(accessToken, account)

export const getVipInfoByBackEnd = async ({
  access,
  chainId,
  isSign,
  deadline,
  nonce,
}: {
  access: AccessParams
  chainId: number
  isSign: boolean
  deadline: number
  nonce: number
}) => {
  return http.get<ApiResponse<VipInfoByBackend>>(
    `${baseUrl}/openapi/gateway/vip/trade_config?chainId=${chainId}&sign=${isSign}&deadline=${deadline}&nonce=${nonce}`,
    undefined,
    { headers: withAccessHeaders(access) },
  )
}
