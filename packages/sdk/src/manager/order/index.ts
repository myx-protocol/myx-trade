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
    const accessToken = await this.configManager.getCurrentAccessToken();
    if (!accessToken) {
      return {
        code: -1,
        message: "accessToken is empty",
      };
    }

    const res = await getOrders(accessToken, config.chainId);
    return {
      code: 0,
      data: res.data,
    };

  }
}
