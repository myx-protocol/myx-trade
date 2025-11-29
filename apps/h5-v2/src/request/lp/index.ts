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
  MarketPoolStateDataResponse,
} from '@/request/lp/type.ts'
import { baseUrl, DEFAULT_LIMIT, http } from '@/request'
import type { ChainId } from '@/config/chain.ts'
import { addQueryParams } from '../utils'
import type { BaseResponse, CookRequest, TimeInterval } from '@/request/type.ts'

export const getMarketTokenSniper = async (chainId: ChainId, limit: number = DEFAULT_LIMIT) => {
  return await http.get<TokenSniperResponse>(
    `${baseUrl}/openapi/scan/market/token-sniper${addQueryParams({
      limit,
      chainId,
    })}`,
  )
}

export const getCookNews = async (
  params: CookRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  return await http.get<CookNewsResponse>(
    `${baseUrl}/openapi/gateway/scan/market/cook-new${addQueryParams(params)}`,
  )
}

export const getCookSoonList = async (
  params: CookRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  return await http.get<CookSoonResponse>(
    `${baseUrl}/openapi/gateway/scan/market/cook-soon${addQueryParams(params)}`,
  )
}

export const getTokenSniperList = async (
  params: CookRequest = { limit: DEFAULT_LIMIT, sortOrder: 'desc' },
) => {
  const { limit, sortOrder, ...reset } = params
  return await http.get<TokenSniperResponse>(
    `${baseUrl}/openapi/gateway/scan/market/token-sniper${addQueryParams({
      limit: limit ?? DEFAULT_LIMIT,
      sortOrder: sortOrder ?? 'desc',
      ...reset,
    })}`,
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
  return await http
    .get(
      `${baseUrl}/openapi/gateway/scan/mobula/wallet/portfolio${addQueryParams({
        wallet: account,
        period,
        pnl: 'true',
        test: 'true',
        // blockchains: chainIds.map((chainId) => `evm:${chainId}`).join(','),
      })}`,
    )
    .then((result) => {
      return JSON.parse(result.data)
    })
}

export const getTokenDetails = async (address: string, chainId?: number) => {
  return await http
    .get(
      `${baseUrl}/openapi/gateway/scan/mobula/tokenDetails${addQueryParams({
        address,
        blockchain: `evm:${chainId}`,
        // test: 'true',
      })}`,
    )
    .then((result) => {
      console.log('result', JSON.parse(result.data))
      return JSON.parse(result.data)
    })
}

//35. 获取实时TVL
export const getMarketTvl = async (params: {
  chainId: number
  poolId: string
}): Promise<BaseResponse & { data: string }> => {
  return await http.get(`${baseUrl}/openapi/gateway/scan/market/tvl${addQueryParams(params)}`)
}

type AssetParams = { asset: string; chainId?: number }
type SymbolParams = { symbol: string; chainId?: number }

export type MarketDataSearchParams = AssetParams | SymbolParams

export const getMarketData = async (params: MarketDataSearchParams) => {
  const query = {
    asset: 'asset' in params ? params.asset : undefined,
    symbol: 'symbol' in params ? params.symbol : undefined,
    blockchain: params?.chainId,
  }
  return await http
    .get(`${baseUrl}/openapi/gateway/scan/mobula/getMarketData${addQueryParams(query)}`)
    .then((result) => {
      console.log('result', JSON.parse(result.data))
      return JSON.parse(result.data)
    })
}

export const getMarketPoolStateData = async (
  params: { chainId: number; address: string }[],
): Promise<MarketPoolStateDataResponse> => {
  return await http.post(`${baseUrl}/openapi/gateway/scan/market/state`, params)
}
