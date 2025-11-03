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

export class Markets {
  private configManager: ConfigManager;
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
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
  async getKlineList(params: Omit<GetKlineDataParams, "chainId">) {
    const config = this.configManager.getConfig();
    return (
      await getKlineData({
        ...params,
        chainId: config?.chainId,
      })
    ).data;
  }

  async getKlineLatestBar(params: Omit<GetKlineDataParams, "chainId">) {
    const config = this.configManager.getConfig();
    return (
      await getKlineLatestBar({
        ...params,
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
