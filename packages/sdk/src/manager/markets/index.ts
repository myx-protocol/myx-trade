import { ConfigManager } from "@/manager/config";
import {
  getKlineData,
  GetKlineDataParams,
  getKlineLatestBar,
  getPoolLevelConfig,
  getPools,
  getTickerData,
  GetTickerDataParams,
  searchMarket,
  searchMarketAuth,
  SearchMarketParams,
  addFavorite,
  AddFavoriteParams,
  removeFavorite,
  RemoveFavoriteParams,
  getFavoritesList,
  FavoritesListParams,
  getBaseDetail,
  type GetBaseDetailParams,
  getMarketDetail,
  type GetMarketDetailParams,
} from "@/api";
import { KlineResolution } from "../subscription/types";
import { Utils } from "../utils";
import { MyxErrorCode, MyxSDKError } from "../error/const";

export class Markets {
  private configManager: ConfigManager;
  private utils: Utils;
  constructor(configManager: ConfigManager, utils: Utils) {
    this.configManager = configManager;
    this.utils = utils;
  }

  getMarkets() {
    return Promise.resolve([]);
  }

  async listPools() {
    return (await getPools()).data;
  }

  async getPoolLevelConfig(poolId: string) {
    const config = this.configManager.getConfig();
    return (
      await getPoolLevelConfig({
        poolId,
        chainId: config?.chainId,
      })
    ).data;
  }

  /**
   * kline start
   */
  async getKlineList({
    interval,
    ...params
  }: Pick<GetKlineDataParams, "poolId" | "limit" | "endTime"> & {
    interval: KlineResolution;
  }) {
    const config = this.configManager.getConfig();
    return (
      await getKlineData({
        ...params,
        interval: this.utils.transferKlineResolutionToInterval(interval),
        chainId: config?.chainId,
      })
    ).data;
  }

  async getKlineLatestBar({
    interval,
    ...params
  }: Pick<GetKlineDataParams, "poolId" | "limit" | "endTime"> & {
    interval: KlineResolution;
  }) {
    const config = this.configManager.getConfig();
    return (
      await getKlineLatestBar({
        ...params,
        interval: this.utils.transferKlineResolutionToInterval(interval),
        chainId: config?.chainId,
      })
    ).data;
  }
  /**
   * kline end
   */

  /**
   * ticker start
   */
  async getTickerList(params: Omit<GetTickerDataParams, "chainId">) {
    const config = this.configManager.getConfig();
    return (
      await getTickerData({
        ...params,
        chainId: config?.chainId,
      })
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
  async searchMarketAuth(params: SearchMarketParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return (
      await searchMarketAuth({
        ...params,
        accessToken: accessToken,
      })
    ).data;
  }

  /**
   * search by unauthenticated users
   */
  async searchMarket(params: SearchMarketParams) {
    return (await searchMarket(params)).data;
  }

  /**
   * get favorites list
   * (only for authenticated users)
   */
  async getFavoritesList(params: FavoritesListParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return (
      await getFavoritesList({
        ...params,
        accessToken: accessToken,
      })
    ).data;
  }
  /**
   * favorite
   */
  async addFavorite(params: AddFavoriteParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return (
      await addFavorite({
        ...params,
        accessToken: accessToken,
      })
    ).data;
  }

  async removeFavorite(params: RemoveFavoriteParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return (
      await removeFavorite({
        ...params,
        accessToken: accessToken,
      })
    ).data;
  }

  /**
   * base detail
   */
  async getBaseDetail(params: GetBaseDetailParams) {
    return (await getBaseDetail(params)).data;
  }

  /**
   * get market detail
   */
  async getMarketDetail(params: GetMarketDetailParams) {
    return (await getMarketDetail(params)).data;
  }
}
