import { ConfigManager } from "@/manager/config";
import {
  GetKlineDataParams,
  GetTickerDataParams,
  SearchMarketParams,
  AddFavoriteParams,
  RemoveFavoriteParams,
  FavoritesListParams,
  type GetBaseDetailParams,
  type GetMarketDetailParams,
} from "@/api";
import { KlineResolution } from "../subscription/types/index.js";
import { Utils } from "../utils/index.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { Api } from "../api/index.js";
import { getDataProviderContract } from "@/web3/providers.js";

export class Markets {
  private configManager: ConfigManager;
  private utils: Utils;
  private api: Api;
  constructor(configManager: ConfigManager, utils: Utils, api: Api) {
    this.configManager = configManager;
    this.utils = utils;
    this.api = api;
  }

  getMarkets() {
    return Promise.resolve([]);
  }

  async getPoolLevelConfig(poolId: string, chainId: number) {
    return (
      await this.api.getPoolLevelConfig({
        poolId,
        chainId,
      })
    ).data;
  }

  /**
   * kline start
   */
  async getKlineList({
    interval,
    ...params
  }: Pick<GetKlineDataParams, "poolId" | "limit" | "endTime" | "chainId"> & {
    interval: KlineResolution;
  }) {
    return (
      await this.api.getKlineData(
        {
          ...params,
          interval: this.utils.transferKlineResolutionToInterval(interval),
        }
      )
    ).data;
  }

  async getKlineLatestBar({
    interval,
    ...params
  }: Pick<GetKlineDataParams, "poolId" | "limit" | "endTime" | "chainId"> & {
    interval: KlineResolution;
  }) {
    const config = this.configManager.getConfig();
    return (
      await this.api.getKlineLatestBar(
        {
          ...params,
          interval: this.utils.transferKlineResolutionToInterval(interval),
        }
      )
    ).data;
  }
  /**
   * kline end
   */

  /**
   * ticker start
   */
  async getTickerList(params: GetTickerDataParams) {
    return (
      await this.api.getTickerData(params)
    ).data;
  }

  /**
   * ticker end
   */

  /**
   * search by access token
   * (only for authenticated users)
   *
   */
  async searchMarketAuth(params: SearchMarketParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    return (
      await this.api.searchMarketAuth(
        {
          address: address,
          ...params,
          accessToken: accessToken,
        }
      )
    ).data;
  }

  /**
   * search by unauthenticated users
   */
  async searchMarket(params: SearchMarketParams) {
    return (
      await this.api.searchMarket(params)
    ).data;
  }

  /**
   * get favorites list
   * (only for authenticated users)
   */
  async getFavoritesList(params: FavoritesListParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    return (
      await this.api.getFavoritesList(
        {
          ...params,
          address: address,
          accessToken: accessToken,
        }
      )
    ).data;
  }
  /**
   * favorite
   */
  async addFavorite(params: AddFavoriteParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    return (
      await this.api.addFavorite(
        {
          ...params,
          address: address,
          accessToken: accessToken,
        }
      )
    ).data;
  }

  async removeFavorite(params: RemoveFavoriteParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    return (
      await this.api.removeFavorite(
        {
          ...params,
          address: address,
          accessToken: accessToken,
        }
      )
    ).data;
  }

  /**
   * base detail
   */
  async getBaseDetail(params: GetBaseDetailParams) {
    return (
      await this.api.getBaseDetail(params)
    ).data;
  }

  /**
   * get market detail
   */
  async getMarketDetail(params: GetMarketDetailParams) {
    return (
      await this.api.getMarketDetail(params)
    ).data;
  }

  /**
   * get pool symbol all
   */
  async getPoolSymbolAll() {
    return (
      await this.api.getPoolSymbolAll()
    ).data;
  }

  async getPoolFundingFeeInfo({
    poolId,
    chainId,
    marketPrice,
  }: {
    poolId: string;
    chainId: number;
    marketPrice: string;
  }) {
    const dataProviderContract = await getDataProviderContract(chainId);
    try {
      const request = await dataProviderContract.read.getPoolInfo([poolId, marketPrice]);
      return {
        code: 0,
        data: request,
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }
}
