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
import { KlineResolution } from "../subscription/types";
import { Utils } from "../utils";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { Api } from "../api";

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
    const config = this.configManager.getConfig();
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
    const config = this.configManager.getConfig();
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
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
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
    const config = this.configManager.getConfig();
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
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
    const config = this.configManager.getConfig();
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
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
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
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
}
