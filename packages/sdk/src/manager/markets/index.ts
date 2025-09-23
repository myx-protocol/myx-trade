import { http } from "@/api/request";
import { ConfigManager } from "@/manager/config";

import { BASE_URL } from "@/config/url";
import { getPoolLevelConfig, getPools } from "@/api";

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
}
