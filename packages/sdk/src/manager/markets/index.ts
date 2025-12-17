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
    const config = this.configManager.getConfig();
    return (
      await getKlineData(
        {
          ...params,
          interval: this.utils.transferKlineResolutionToInterval(interval),
        },
        {
          isProd: !config?.isTestnet,
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
      await getKlineLatestBar(
        {
          ...params,
          interval: this.utils.transferKlineResolutionToInterval(interval),
        },
        {
          isProd: !config?.isTestnet,
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
    const config = this.configManager.getConfig();
    return (
      await getTickerData(params, {
        isProd: !config?.isTestnet,
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
  async searchMarketAuth(params: SearchMarketParams, address: string) {
    const config = this.configManager.getConfig();
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return (
      await searchMarketAuth(
        {
          address: address,
          ...params,
          accessToken: accessToken,
        },
        {
          isProd: !config?.isTestnet,
        }
      )
    ).data;
  }

  /**
   * search by unauthenticated users
   */
  async searchMarket(params: SearchMarketParams) {
    const config = this.configManager.getConfig();
    return (
      await searchMarket(params, {
        isProd: !config?.isTestnet,
      })
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
      await getFavoritesList(
        {
          ...params,
          address: address,
          accessToken: accessToken,
        },
        {
          isProd: !config?.isTestnet,
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
      await addFavorite(
        {
          ...params,
          address: address,
          accessToken: accessToken,
        },
        {
          isProd: !config?.isTestnet,
        }
      )
    ).data;
  }

  async removeFavorite(params: RemoveFavoriteParams, address: string) {
    const config = this.configManager.getConfig();
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    return (
      await removeFavorite(
        {
          ...params,
          address: address,
          accessToken: accessToken,
        },
        {
          isProd: !config?.isTestnet,
        }
      )
    ).data;
  }

  /**
   * base detail
   */
  async getBaseDetail(params: GetBaseDetailParams) {
    return (
      await getBaseDetail(params)
    ).data;
  }

  /**
   * get market detail
   */
  async getMarketDetail(params: GetMarketDetailParams) {
    return (
      await getMarketDetail(params)
    ).data;
  }

  /**
   * get pool symbol all
   */
  async getPoolSymbolAll() {
    return (
      await getPoolSymbolAll()
    ).data;
  }
}
