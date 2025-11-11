import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { Utils } from "../utils";
import { ethers } from "ethers";
import Account_ABI from "@/abi/Account.json";
import { getContractAddressByChainId } from "@/config/address/index";
import { GetHistoryOrdersParams, getTradeFlow } from "@/api";
import { MyxErrorCode, MyxSDKError } from "../error/const";
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
   * get tradable amount
   */
  async getTradableAmount({ poolId }: { poolId: string }) {
    const config: MyxClientConfig = this.configManager.getConfig();
    const contractAddress = getContractAddressByChainId(config.chainId);
    const accountContract = new ethers.Contract(
      contractAddress.Account,
      Account_ABI,
      config.signer
    );
    const assets = await accountContract.getTradableAmount(config.signer.getAddress(), poolId);
    return assets;
  }

  async getTradeFlow(params: GetHistoryOrdersParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    const res = await getTradeFlow({ accessToken, ...params });
    return {
      code: 0,
      data: res.data,
    };
  }
}
