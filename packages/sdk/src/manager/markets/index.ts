import { $fetch } from "@/api/request";
import { MyxBase } from "../base";
import { MyxClientConfig } from "@/manager/config";

const baseUrl= "https://api-test.myx.cash"


export class MyxMarkets extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  getMarkets () {
    return Promise.resolve([])
  }

  async listPools () {
    const rs = await $fetch("GET", `${baseUrl}/v2/mx-scan/market/list`);

    return rs.data || []
  }

  async getPoolLevelConfig (poolId: string) {
   const config = this.getConfig() as MyxClientConfig
   const rs = await $fetch("GET", `${baseUrl}/v2/mx-risk/market_pool/level_config?poolId=${poolId}&chainId=${config?.chainId}`);

    return rs.data
  }
}

