import { ConfigManager } from "@/manager/config";
import {
  getKlineData,
  GetKlineDataParams,
  getKlineLatestBar,
  getPoolLevelConfig,
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
import { getPoolSymbolAll } from "@/api/pool";

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
  }: Pick<GetKlineDataParams, "poolId" | "limit" | "endTime" | "chainId"> & {
    interval: KlineResolution;
  }) {
    return (
      await getKlineData({
        ...params,
        interval: this.utils.transferKlineResolutionToInterval(interval),
      })
    ).data;
  }

  async getKlineLatestBar({
    interval,
    ...params
  }: Pick<GetKlineDataParams, "poolId" | "limit" | "endTime" | "chainId"> & {
    interval: KlineResolution;
  }) {
    return (
      await getKlineLatestBar({
        ...params,
        interval: this.utils.transferKlineResolutionToInterval(interval),
      })
    ).data;
  }
  /**
   * kline end
   */

  /**
   * ticker start
   */
  async getTickerList(params: GetTickerDataParams) {
    return (await getTickerData(params)).data;
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
      await searchMarketAuth({
        address: address,
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
  async getFavoritesList(params: FavoritesListParams, address: string) {
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
        address: address,
        accessToken: accessToken,
      })
    ).data;
  }
  /**
   * favorite
   */
  async addFavorite(params: AddFavoriteParams, address: string) {
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
        address: address,
        accessToken: accessToken,
      })
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
      await removeFavorite({
        ...params,
        address: address,
        accessToken: accessToken,
      })
    ).data;
  }

  /**
   * base detail
   */
  async getBaseDetail(params: GetBaseDetailParams) {
    // @ts-ignore
    // todo: allen
    return (await getBaseDetail(params)).data;
  }

  /**
   * get market detail
   */
  async getMarketDetail(params: GetMarketDetailParams) {
     // @ts-ignore
    // todo: all
    return (await getMarketDetail(params)).data;
  }

  /**
   * get pool symbol all
   */
  async getPoolSymbolAll() {
     // @ts-ignore
    // todo: all
    return (await getPoolSymbolAll()).data;
  }
}
