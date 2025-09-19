import { $fetch } from "@/api/request";
import { ConfigManager } from "@/manager/config";

import { BASE_URL } from "@/config/url";

export class Markets {
  private configManager: ConfigManager;
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  getMarkets() {
    return Promise.resolve([]);
  }

  async listPools() {
    const rs = await $fetch("GET", `${BASE_URL}/v2/mx-scan/market/list`);

    return rs.data || [];
  }

  async getPoolLevelConfig(poolId: string) {
    const config = this.configManager.getConfig();
    const rs = await $fetch(
      "GET",
      `${BASE_URL}/v2/mx-risk/market_pool/level_config?poolId=${poolId}&chainId=${config?.chainId}`
    );

    return rs.data;
  }
}
