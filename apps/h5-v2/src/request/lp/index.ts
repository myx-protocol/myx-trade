import type {
  CookNewsResponse,
  CookSoonResponse,
  QuotePoolResponse,
  TokenSniperResponse,
  QuotePoolListRequest,
  BaseQuoteTopRequest,
  BaseQuoteTopResponse,
  BaseLpDetailResponse,
  QuoteLpDetailResponse,
  TrenchRequest,
  TrenchResponse,
  LpPriceHistoryRequest,
  LpPriceHistoryResponse,
  QuoteAprTopResponse,
  QuotePoolTokenTopResponse,
  LpAssetsRequest,
  LpAssetsResponse,
} from '@/request/lp/type.ts'
import { baseUrl, DEFAULT_LIMIT, http } from '@/request'
import type { ChainId } from '@/config/chain.ts'
import { addQueryParams } from '../utils'
import type { FilterRequest, TimeInterval } from '@/request/type.ts'

export const getMarketTokenSniper = async (chainId: ChainId, limit: number = DEFAULT_LIMIT) => {
  return await http.get<TokenSniperResponse>(
    `${baseUrl}/openapi/scan/market/token-sniper${addQueryParams({
      limit,
      chainId,
    })}`,
  )
}

export const getCookNews = async (
  params: FilterRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  return await http.get<CookNewsResponse>(
    `${baseUrl}/openapi/gateway/scan/market/cook-new${addQueryParams(params)}`,
  )
}

export const getCookSoonList = async (
  params: FilterRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  return await http.get<CookSoonResponse>(
    `${baseUrl}/openapi/gateway/scan/market/cook-soon${addQueryParams(params)}`,
  )
}

export const getTokenSniperList = async (
  params: FilterRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  return await http.get<TokenSniperResponse>(
    `${baseUrl}/openapi/gateway/scan/market/token-sniper${addQueryParams(params)}`,
  )
}

export const getTrenchList = async (params: TrenchRequest = { limit: DEFAULT_LIMIT }) => {
  return await http.get<TrenchResponse>(
    `${baseUrl}/openapi/gateway/scan/market/trench${addQueryParams(params)}`,
  )
}
export const getBaseLPDetail = async (chainId: number, poolId: string) => {
  return await http.get<BaseLpDetailResponse>(
    `${baseUrl}/openapi/gateway/scan/market/base-details${addQueryParams({ chainId, poolId })}`,
  )
}
export const getQuoteLpList = async (
  accessToken: string,
  params: QuotePoolListRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  if (!accessToken) return { data: [] }
  return await http.get<QuotePoolResponse>(
    `${baseUrl}/openapi/gateway/scan/market/lp-quote${addQueryParams(params)}`,
    undefined,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    },
  )
}
export const getQuoteLPDetail = async (chainId: number, poolId: string) => {
  return await http.get<QuoteLpDetailResponse>(
    `${baseUrl}/openapi/gateway/scan/market/quote-details${addQueryParams({ chainId, poolId })}`,
  )
}
export const getBaseTokenTop = async (
  params: BaseQuoteTopRequest = { sortField: 'tokenCreateTime' },
) => {
  return await http.get<BaseQuoteTopResponse>(
    `${baseUrl}/openapi/gateway/scan/market/base-token-top${addQueryParams(params)}`,
  )
}

export const getLpPriceHistory = async (params: LpPriceHistoryRequest) => {
  return await http.get<LpPriceHistoryResponse>(
    `${baseUrl}/openapi/gateway/scan/market/price/history${addQueryParams(params)}`,
  )
}

export const getQuoteAprTop = async () => {
  return await http.get<QuoteAprTopResponse>(`${baseUrl}/openapi/gateway/scan/market/quote-apr-top`)
}

// QuoteTokenTop
export const getQuoteTokenTop = async (params: {
  timeInterval?: TimeInterval
  chainId?: number
  sortField?: 'tokenCreateTime' | 'quoteTvl' | 'quoteApr'
}) => {
  return await http.get<QuotePoolTokenTopResponse>(
    `${baseUrl}/openapi/gateway/scan/market/quote-token-top${addQueryParams(params)}`,
  )
}

export const getLpAssets = async (accessToken: string, params: LpAssetsRequest) => {
  return await http.get<LpAssetsResponse>(
    `${baseUrl}/openapi/gateway/scan/market/lp-assets${addQueryParams(params)}`,
    undefined,
    {
      headers: {
        myx_openapi_access_token: accessToken,
      },
    },
  )
}

export const getTokenDetail = async (chainId: number, tokenAddress: string) => {
  return await http.get(
    `https://demo-api.mobula.io/api/2/markets/details?blockchain=evm:${chainId}&address=${tokenAddress}&test=true`,
  )
}
export const getAccountHoldings = async (
  account: string,
  chainIds: ChainId[] = [],
  period = '30d',
) => {
  console.log(chainIds.map((chainId) => `evm:${chainId}`).join(','))
  return await http.get(
    `https://demo-api.mobula.io/api/1/wallet/portfolio${addQueryParams({
      wallet: account,
      period,
      pnl: 'true',
      // test: 'true',
      // blockchains: chainIds.map((chainId) => `evm:${chainId}`).join(','),
    })}`,
  )
}

export const getTokenHolders = async (asset: string, chainId?: number) => {
  return await http.get(
    `https://demo-api.mobula.io/api/1/market/token/holders${addQueryParams({
      asset,
      blockchain: asset.startsWith('0x') ? undefined : chainId,
    })}`,
  )
}
