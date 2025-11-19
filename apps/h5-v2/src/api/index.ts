import { baseUrl } from '@/request'
import { http } from '@/request/http'

export const getAccessToken = async (
  appId: string,
  timestamp: number,
  expireTime: number,
  allowAccount: string,
  signature: string,
) => {
  try {
    const res = await http.get(
      `${baseUrl}/openapi/gateway/auth/api_key/create_token?appId=${appId}&timestamp=${timestamp}&expireTime=${expireTime}&allowAccount=${allowAccount}&signature=${signature}`,
    )
    return {
      code: 0,
      msg: null,
      data: {
        accessToken: res.data.accessToken,
        expireAt: res.data.expireAt,
        allowAccount: res.data.allowAccount,
        appId: appId,
      },
    }
  } catch (error) {
    console.error('getAccessToken error-->', error)
    return {
      code: -1,
      msg: 'getAccessToken error',
      data: {
        accessToken: '',
        expireAt: 0,
        allowAccount: '',
        appId: '',
      },
    }
  }
}

export const getPoolLevelConfig = async (poolId: string, chainId: number) => {
  try {
    const res = await http.get(
      `${baseUrl}/openapi/gateway/risk/market_pool/level_config?poolId=${poolId}&chainId=${chainId}`,
    )
    return {
      code: 0,
      msg: null,
      data: res.data,
    }
  } catch (error) {
    console.error('getAccessToken error-->', error)
    return {
      code: -1,
      msg: 'getPoolLevelConfig error',
      data: null,
    }
  }
}
