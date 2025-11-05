import { ConfigManager } from "@/manager/config";
import {
  getKlineData,
  GetKlineDataParams,
  getKlineLatestBar,
  getPoolLevelConfig,
  getPools,
  getTickerData,
  GetTickerDataParams,
} from "@/api";
import { KlineResolution } from "../subscription/types";
import { Utils } from "../utils";

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
}
