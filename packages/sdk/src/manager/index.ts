import { SubScription } from "@/subscription";
import { ConfigManager } from "./config/index";
import { type MyxClientConfig } from "./config/index";
import { Logger } from "@/logger";
import { Trading } from "./trading";
import { Markets } from "./markets";

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

  constructor(options: MyxClientConfig) {
    this.configManager = new ConfigManager(options);
    this.logger = new Logger({
      logLevel: options.logLevel,
    });

    /**
     * initialize trading
     */
    this.trading = new Trading(this.configManager);

    /**
     * initialize markets
     */
    this.markets = new Markets(this.configManager);

    /**
     * initialize subscription
     */
    this.subscription = new SubScription(this.configManager, this.logger);
  }
}
