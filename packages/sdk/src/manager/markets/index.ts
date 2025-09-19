import { $fetch } from "@/api/request";
import { MyxBase } from "../base";
import { MyxClientConfig } from "@/manager/config";
import { BASE_URL } from "@/config/url";



export class MyxMarkets extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  getMarkets () {
    return Promise.resolve([])
  }

  async listPools () {
    const rs = await $fetch("GET", `${BASE_URL}/v2/mx-scan/market/list`);

    return rs.data || []
  }

  async getPoolLevelConfig (poolId: string) {
   const config = this.getConfig() as MyxClientConfig
   const rs = await $fetch("GET", `${BASE_URL}/v2/mx-risk/market_pool/level_config?poolId=${poolId}&chainId=${config?.chainId}`);

    return rs.data
  }
}

