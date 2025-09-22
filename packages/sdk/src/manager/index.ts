import { SubScription } from "@/manager/subscription";
import { ConfigManager } from "./config/index";
import { type MyxClientConfig } from "./config/index";
import { Logger } from "@/logger";
import { Trading } from "./trading";
import { Markets } from "./markets";
import { Position } from "./position";

// types

export * from "./subscription/types";

export class MyxClient {
  /**
   * private properties
   */
  private configManager: ConfigManager;
  private logger: Logger;

  /**
   * public properties
   */
  public subscription: SubScription;
  public trading: Trading;
  public markets: Markets;
  public position: Position;

  /**
   * 获取配置管理器（用于访问 accessToken 相关方法）
   */
  public getConfigManager(): ConfigManager {
    return this.configManager;
  }

  constructor(options: MyxClientConfig) {
    this.configManager = new ConfigManager(options);
    this.logger = new Logger({
      logLevel: options.logLevel,
    });

    /**
     * initialize trading
     */
    this.trading = new Trading(this.configManager, this.logger);

    /**
     * initialize markets
     */
    this.markets = new Markets(this.configManager);

    this.position = new Position(this.configManager, this.logger);

    /**
     * initialize subscription
     */
    this.subscription = new SubScription(this.configManager, this.logger);
  }
}
