import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { Utils } from "../utils";
import { ethers } from "ethers";
import Account_ABI from "@/abi/Account.json";

export class Account {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
  }

  /**
   * get locked assets
   */
  async getUserAssets() {
    const config: MyxClientConfig = this.configManager.getConfig();
    const accountContract = new ethers.Contract(
      // config.accountAddress,
      '',
      Account_ABI,
      config.signer
    );
    const assets = await accountContract.getUserAssets(config.signer.getAddress());
    return assets;
  }


  /**
   * get tradable amount
   */
  async getTradableAmount() {
    const config: MyxClientConfig = this.configManager.getConfig();
    const accountContract = new ethers.Contract(
      // config.accountAddress,
      '',
      Account_ABI,
      config.signer
    );
    const assets = await accountContract.getUserAssets(config.signer.getAddress());
    return assets;
  }


}
