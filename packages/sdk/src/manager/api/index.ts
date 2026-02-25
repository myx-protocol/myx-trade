import {
  GetHistoryOrdersParams,
  HistoryOrderItem,
  PositionHistoryItem,
  TradeFlowItem,
} from "@/api/account";
import { ConfigManager } from "../config";
import { http } from "@/api/request";
import {
  AppealDetail,
  AppealListItem,
  AppealNodeVoteItem,
  AppealNodeVoteListItem,
  AppealReconsiderationDetail,
  AppealReconsiderationListItem,
  AppealReimbursementItem,
  AppealReimbursementParams,
  AppealUploadEvidenceParams,
  GetAppealDetailParams,
  GetAppealListParams,
  GetAppealNodeVoteListParams,
  GetAppealReconsiderationDetailParams,
  GetAppealReconsiderationListParams,
  GetAppealVoteNodeDetailParams,
  GetIsVoteNodeParams,
  GetWarmholeSignParams,
  GetWarmholeSignResponse,
  IsVoteNodeEnum,
  PostVoteResponse,
  PostVoteSignatureParams,
} from "./appeal-type";
import { Logger } from "@/logger";
import {
  AccessTokenRequest,
  ApiResponse,
  BaseDetailResponse,
  FavoritesListItem,
  KlineDataItemType,
  MarketDetailResponse,
  MarketInfo,
  PoolOpenOrdersResponse,
  PoolResponse,
  PositionResponse,
  SearchResultResponse,
  TickerDataItem,
} from "@/api/type";
import {
  AddFavoriteParams,
  FavoritesListParams,
  FetchForwarderGetParams,
  FetchForwarderGetResponse,
  ForwarderTxParams,
  GetBaseDetailParams,
  GetKlineDataParams,
  GetMarketDetailParams,
  GetPoolLevelConfigParams,
  GetTickerDataParams,
  PoolLevelConfig,
  PoolSymbolAllResponse,
  RemoveFavoriteParams,
  SearchMarketParams,
} from "@/api";
import { addQueryParams } from "@/api/utils";
import { ChainId } from "@/config/chain";
import { Request } from "./request";

export class Api extends Request {
  private logger: Logger;
  constructor(configManager: ConfigManager, logger: Logger) {
    super(configManager);
    this.logger = logger;
  }

  async getTradeFlow({
    accessToken,
    address,
    ...params
  }: GetHistoryOrdersParams & AccessTokenRequest) {
    return http.get<ApiResponse<TradeFlowItem[]>>(
      `${this.getHost()}/openapi/gateway/scan/trade/flow`,
      params,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async getPoolSymbolAll() {
    return http.get<ApiResponse<PoolSymbolAllResponse[]>>(
      `${this.getHost()}/openapi/gateway/scan/pools`
    );
  }

  async fetchForwarderGetApi(params: FetchForwarderGetParams) {
    const rs: FetchForwarderGetResponse = await http.get(
      `${this.getHost()}/v2/agent/forwarder/get${addQueryParams(params)}`
    );

    return rs;
  }

  async getPoolList() {
    return http.get<ApiResponse<any[]>>(
      `${this.getHost()}/openapi/gateway/scan/market/list`
    );
  }

  async forwarderTxApi(params: ForwarderTxParams, chainId: number) {
    return http.post<ApiResponse<any>>(
      `${this.getHost()}/v2/agent/forwarder/tx-v2`,
      params,
      {
        headers: {
          "myx-chain-id": chainId.toString(),
        },
      }
    );
  }

  async getOraclePrice(chainId: ChainId, poolIds: string[] = []) {
    if (!!poolIds.length) {
      return http.get(`${this.getHost()}/openapi/gateway/quote/price/oracles`, {
        chainId,
        poolIds: poolIds.join(","),
      });
    }

    throw new Error("Invalid pool id");
  }

  async getPoolDetail(chainId: number, poolId: string): Promise<PoolResponse> {
    return await http.get<PoolResponse>(
      `${this.getHost()}/openapi/gateway/scan/market/info?chainId=${chainId}&poolId=${poolId}`
    );
  }

  async getPoolLevelConfig({ poolId, chainId }: GetPoolLevelConfigParams) {
    return http.get<ApiResponse<PoolLevelConfig>>(
      `${this.getHost()}/openapi/gateway/risk/market_pool/level_config${addQueryParams(
        {
          poolId,
          chainId,
        }
      )}`
    );
  }

  async getPositions(accessToken: string, address: string) {
    return await http.get<PositionResponse>(
      `${this.getHost()}/openapi/gateway/scan/position/open`,
      undefined,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async getOrders(accessToken: string, address: string) {
    return await http.get<PositionResponse>(
      `${this.getHost()}/openapi/gateway/scan/order/open`,
      undefined,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async getPoolOpenOrders(
    accessToken: string,
    address: string,
    chainId: ChainId
  ) {
    return await http.get<PoolOpenOrdersResponse>(
      `${this.getHost()}/openapi/gateway/scan/market/pool-order/open?chainId=${chainId}`,
      undefined,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async getKlineData({
    chainId,
    poolId,
    endTime,
    limit,
    interval,
  }: GetKlineDataParams) {
    return http.get<ApiResponse<KlineDataItemType[]>>(
      `${this.getHost()}/openapi/gateway/quote/candles`,
      {
        chainId,
        poolId,
        endTime,
        limit,
        interval,
      }
    );
  }

  async getKlineLatestBar(
    params: Pick<GetKlineDataParams, "chainId" | "poolId" | "interval">
  ) {
    return http.get<ApiResponse<KlineDataItemType>>(
      `${this.getHost()}/openapi/gateway/quote/candle/latest`,
      params
    );
  }

  async getTickerData({ chainId, poolIds }: GetTickerDataParams) {
    return http.get<ApiResponse<TickerDataItem[]>>(
      `${this.getHost()}/openapi/gateway/quote/candle/tickers`,
      {
        chainId,
        poolIds: poolIds.join(","),
      }
    );
  }

  async getAllTickers() {
    return http.get<ApiResponse<TickerDataItem[]>>(
      `${this.getHost()}/v2/mx-gateway/quote/candle/all_tickers`
    );
  }

  async searchMarketAuth({
    accessToken,
    address,
    ...params
  }: SearchMarketParams & AccessTokenRequest) {
    return http.get<ApiResponse<SearchResultResponse>>(
      `${this.getHost()}/openapi/gateway/scan/market/ac-search`,
      params,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async searchMarket({ ...params }: SearchMarketParams) {
    return http.get<ApiResponse<SearchResultResponse>>(
      `${this.getHost()}/openapi/gateway/scan/market/search`,
      params
    );
  }

  async addFavorite({
    accessToken,
    address,
    ...params
  }: AddFavoriteParams & AccessTokenRequest) {
    return http.get<ApiResponse<null>>(
      `${this.getHost()}/openapi/gateway/scan/market/add-favorites`,
      params,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async removeFavorite({
    accessToken,
    address,
    ...params
  }: RemoveFavoriteParams & AccessTokenRequest) {
    return http.get<ApiResponse<null>>(
      `${this.getHost()}/openapi/gateway/scan/market/cancel-favorites`,
      params,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async getFavoritesList({
    accessToken,
    address,
    ...params
  }: FavoritesListParams & AccessTokenRequest) {
    return http.get<ApiResponse<FavoritesListItem[]>>(
      `${this.getHost()}/openapi/gateway/scan/market/favorites`,
      params,
      {
        headers: {
          myx_openapi_access_token: accessToken,
          myx_openapi_account: address,
        },
      }
    );
  }

  async getBaseDetail({ ...params }: GetBaseDetailParams) {
    return http.get<ApiResponse<BaseDetailResponse>>(
      `${this.getHost()}/openapi/gateway/scan/market/base-details`,
      params
    );
  }

  async getMarketDetail({ ...params }: GetMarketDetailParams) {
    return http.get<ApiResponse<MarketDetailResponse>>(
      `${this.getHost()}/openapi/gateway/scan/market/detail`,
      params
    );
  }

  async getHistoryOrders({
    accessToken,
    address,
    ...params
  }: GetHistoryOrdersParams & AccessTokenRequest) {
    return http.get<ApiResponse<HistoryOrderItem[]>>(
      `${this.getHost()}/openapi/gateway/scan/order/closed`,
      params,
      {
        headers: {
          myx_openapi_account: address,
          myx_openapi_access_token: accessToken,
        },
      }
    );
  }

  async getPositionHistory({
    accessToken,
    address,
    ...params
  }: GetHistoryOrdersParams & AccessTokenRequest) {
    return http.get<ApiResponse<PositionHistoryItem[]>>(
      `${this.getHost()}/openapi/gateway/scan/position/closed`,
      params,
      {
        headers: {
          myx_openapi_account: address,
          myx_openapi_access_token: accessToken,
        },
      }
    );
  }

  async getMarketList() {
    return http.get<ApiResponse<MarketInfo[]>>(
      `${this.getHost()}/openapi/gateway/scan/market`
    );
  }

  async getAccountVipInfo({
    address,
    accessToken,
    chainId,
    deadline,
    nonce,
  }: {
    address: string;
    accessToken: string;
    chainId: number;
    deadline: number;
    nonce: string;
  }) {
    return http.get<ApiResponse<any>>(
      `${this.getHost()}/openapi/gateway/vip/trade_config`,
      { chainId, deadline, nonce },
      {
        headers: {
          myx_openapi_account: address,
          myx_openapi_access_token: accessToken,
        },
      }
    );
  }

  /**
   * appeal module start ------>
   */
  async getAppealList(params: GetAppealListParams) {
    return this.get<ApiResponse<AppealListItem[]>>(
      "/openapi/gateway/scan/dispute/list",
      params,
      {
        auth: true,
      }
    );
  }

  async getAppealDetail(params: GetAppealDetailParams) {
    return this.get<ApiResponse<AppealDetail>>(
      "/openapi/gateway/scan/dispute/details",
      params,
      {
        auth: true,
      }
    );
  }

  async uploadAppealEvidence(params: AppealUploadEvidenceParams) {
    return this.get<ApiResponse<null>>(
      "/openapi/gateway/scan/dispute/upload/evidence",
      params,
      {
        auth: true,
      }
    );
  }

  async getAppealReconsiderationList(
    params: GetAppealReconsiderationListParams
  ) {
    return this.get<ApiResponse<AppealReconsiderationListItem[]>>(
      "/openapi/gateway/scan/dispute/appeal/list",
      params,
      {
        auth: true,
      }
    );
  }

  async getAppealReconsiderationDetail(
    params: GetAppealReconsiderationDetailParams
  ) {
    return this.get<ApiResponse<AppealReconsiderationDetail>>(
      "/openapi/gateway/scan/dispute/appeal/details",
      params,
      {
        auth: true,
      }
    );
  }

  async getAppealReimbursementList(params: AppealReimbursementParams) {
    return this.get<ApiResponse<AppealReimbursementItem[]>>(
      "/openapi/gateway/scan/reimbursement/list",
      params,
      {
        auth: true,
      }
    );
  }

  async getAppealNodeVoteList(params: GetAppealNodeVoteListParams) {
    return this.get<ApiResponse<AppealNodeVoteListItem[]>>(
      "/openapi/gateway/scan/node/vote-list",
      params
    );
  }

  async getAppealNodeVoteDetails(params: GetAppealVoteNodeDetailParams) {
    return this.get<ApiResponse<AppealNodeVoteItem[]>>(
      "/openapi/gateway/scan/node/vote-details",
      params
    );
  }

  async getIsVoteNode(params: GetIsVoteNodeParams) {
    return this.get<ApiResponse<IsVoteNodeEnum>>(
      "/openapi/gateway/scan/node/vote-node-check",
      params
    );
  }

  async postVoteSignature(params: PostVoteSignatureParams) {
    return this.get<ApiResponse<PostVoteResponse>>(
      `/openapi/gateway/scan/node/vote`,
      params,
      {
        auth: true,
      }
    );
  }

  async getPedingVoteCount() {
    return this.get<ApiResponse<number>>(
      "/openapi/gateway/scan/node/pending-vote-total",
      {},
      {
        auth: true,
      }
    );
  }

  async getMyAppealCount() {
    return this.get<ApiResponse<number>>(
      "/openapi/gateway/scan/processing-total",
      {},
      {
        auth: true,
      }
    );
  }

  async getWarmholeSign(params: GetWarmholeSignParams) {
    return this.get<ApiResponse<GetWarmholeSignResponse>>(
      "/openapi/gateway/scan/get-warmhole-sign",
      params, {
      auth: true
    }
    );
  }

  async getDisputeTotalCount() {
    return this.get<ApiResponse<number>>('/openapi/gateway/scan/dispute/dispute-total', {}, {
      auth: true
    })
  }

  async getAppealTotalCount() {
    return this.get<ApiResponse<number>>('/openapi/gateway/scan/dispute/appeal-total', {}, {
      auth: true
    })
  }

  async getReimbursementTotalCount() {
    return this.get<ApiResponse<number>>('/openapi/gateway/scan/dispute/reimbursement-total', {}, {
      auth: true
    })
  }


  /**
   * appeal module end ------>
   */
  async getCurrentEpoch({
    address,
    accessToken,
    broker,
  }: {
    address: string;
    accessToken: string;
    broker: string;
  }) {
    return http.get<ApiResponse<number>>(
      `${this.getHost()}/openapi/gateway/scan/get-current-epoch`,
      { broker },
      {
        headers: {
          myx_openapi_account: address,
          myx_openapi_access_token: accessToken,
        },
      }
    );
  }
}
