import { $fetch } from "@/api/request";
import { ConfigManager, MyxClientConfig } from "@/manager/config";

const baseUrl = "https://api-test.myx.cash";

export class Markets {
  private configManager: ConfigManager;
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  getMarkets() {
    return Promise.resolve([]);
  }

  async listPools() {
    const rs = await $fetch("GET", `${baseUrl}/v2/mx-scan/market/list`);

    return rs.data || [];
  }

  async getPoolLevelConfig(poolId: string) {
    const chainId = this.configManager.getConfig()?.chainId;
    const rs = await $fetch(
      "GET",
      `${baseUrl}/v2/mx-risk/market_pool/level_config?poolId=${poolId}&chainId=${chainId}`
    );

    return rs.data;
  }
}
