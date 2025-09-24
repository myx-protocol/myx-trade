import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { getOrders } from "@/api";

export class Order {
  private configManager: ConfigManager;
  private logger: Logger;
  constructor(configManager: ConfigManager, logger: Logger) {
    this.configManager = configManager;
    this.logger = logger;
  }


  async getOrders() {
    const config: MyxClientConfig = this.configManager.getConfig();
    
    // 自动获取 accessToken，如果没有或过期会自动刷新
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      return {
        code: -1,
        message: "Failed to obtain accessToken",
      };
    }

    try {
      const res = await getOrders(accessToken, config.chainId);
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        code: -1,
        message: "Failed to fetch orders",
      };
    }
  }
}
