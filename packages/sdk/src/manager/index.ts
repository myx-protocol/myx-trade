import { SubScription } from "@/manager/subscription";
import { ConfigManager } from "./config/index";
import { type MyxClientConfig } from "./config/index";
import { Logger } from "@/logger";
import { Markets } from "./markets";
import { Position } from "./position";
import { Order } from "./order";
import { Utils } from "./utils";
import { Account } from "./account";
import { Api } from "./api";

import { MxSDK } from "@/web3";
import { Seamless } from "./seamless";
import { Appeal } from "./appeal";
import { Referrals } from "./referrals";

// types
export type { MyxClientConfig } from "./config/index";
export * from "./subscription/types";

export class MyxClient {
  /**
   * private properties
   */
  private configManager: ConfigManager;
  public logger: Logger;

  /**
   * public properties
   */
  public subscription: SubScription;
  public markets: Markets;
  public position: Position;
  public order: Order;
  public utils: Utils;
  public account: Account;
  public seamless: Seamless;
  public api: Api;
  public appeal: Appeal
  public referrals: Referrals;
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
     * initialize lp sdk
     */
    const lp = MxSDK.getInstance();
    lp.setConfigManager(this.configManager);
    lp.getMarkets().then();

    /**
     * initialize utils
     */
    this.utils = new Utils(this.configManager, this.logger);

    this.api = new Api(this.configManager, this.logger);

    this.account = new Account(
      this.configManager,
      this.logger,
      this.utils,
      this
    );

    this.seamless = new Seamless(
      this.configManager,
      this.logger,
      this.utils,
      this.account,
      this.api
    );

    /**
     * initialize markets
     */
    this.markets = new Markets(this.configManager, this.utils, this.api);

    /**
     * initialize position
     */
    this.position = new Position(
      this.configManager,
      this.logger,
      this.utils,
      this.seamless,
      this.account,
      this.api
    );

    /**
     * initialize orders
     */
    this.order = new Order(
      this.configManager,
      this.logger,
      this.utils,
      this.seamless,
      this.account,
      this.api
    );

    /**
     * initialize subscription
     */
    this.subscription = new SubScription(this.configManager, this.logger);

    /**
     * initialize appeal
     */
    this.appeal = new Appeal(this);
    /*
     * initialize referrals
     */
    this.referrals = new Referrals(this);
  }

  /**
   * auth the client
   */
  public auth(
    params: Required<
      Pick<MyxClientConfig, "signer" | "getAccessToken" | "walletClient">
    >
  ) {
    this.configManager.auth(params);
  }
  public updateClientChainId(chainId: number, brokerAddress: string) {
    this.configManager.updateClientChainId(chainId, brokerAddress);
  }
  /**
   * close the client
   */
  public close() {
    this.configManager.clear();
    this.subscription.disconnect();
  }

  /**
   * get access token
   */
  public async getAccessToken() {
    return await this.configManager.getAccessToken();
  }
}
