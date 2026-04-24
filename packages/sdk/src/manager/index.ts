import { SubScription } from "@/manager/subscription";
import { ConfigManager } from "./config/index.js";
import { type MyxClientConfig } from "./config/index.js";
import { Logger } from "@/logger";
import { Markets } from "./markets/index.js";
import { Position } from "./position/index.js";
import { Order } from "./order/index.js";
import { Utils } from "./utils/index.js";
import { Account } from "./account/index.js";
import { Api } from "./api/index.js";

import { MxSDK, setConfigManagerForViem, getConfigManagerForViem } from "@/web3";
import { Seamless } from "./seamless/index.js";
import { Appeal } from "./appeal/index.js";
import { Referrals } from "./referrals/index.js";

// types
export type { MyxClientConfig } from "./config/index.js";
export * from "./subscription/types/index.js";
export * from "./api/type.js";

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
  public appeal: Appeal;
  public referrals: Referrals;
  /**
   * Get config manager (for accessToken-related methods)
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
    // Only overwrite the global ref if no authenticated manager exists yet.
    // This prevents a newly-constructed (unauthenticated) client from evicting an already-authed
    // manager and causing "No signer" errors until the next auth() call completes.
    if (!getConfigManagerForViem()?.hasSigner()) {
      lp.setConfigManager(this.configManager);
      setConfigManagerForViem(this.configManager);
    }
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
    this.appeal = new Appeal(this, this.configManager);
    /*
     * initialize referrals
     */
    this.referrals = new Referrals(this);
  }

  /**
   * auth the client
   */
  /** Auth with signer (ethers v5/v6 or ISigner) and/or walletClient (viem). Use walletClient when app uses viem to avoid ethers in bundle. */
  public auth(
    params: Pick<MyxClientConfig, "signer" | "walletClient" | "getAccessToken">
  ) {
    this.configManager.auth(params);
    // Re-register after auth so that the most recently-authed instance is always active.
    // Without this, constructing a new MyxClient after auth overwrites configManagerRef with
    // an unauthenticated manager, causing "No signer" errors on the next contract call.
    const lp = MxSDK.getInstance();
    lp.setConfigManager(this.configManager);
    setConfigManagerForViem(this.configManager);
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
   * Get currently stored access token (does not auto-refresh)
   */
  public async getAccessToken() {
    return await this.configManager.getAccessToken();
  }

  /**
   * Manually refresh access token (must be called explicitly by the client)
   * @param forceRefresh Whether to force refresh
   */
  public async refreshAccessToken(forceRefresh: boolean = false) {
    return await this.configManager.refreshAccessToken(forceRefresh);
  }
}
