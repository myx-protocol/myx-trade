import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { Utils } from "../utils";
import { ethers } from "ethers";
import Account_ABI from "@/abi/Account.json";
import { getContractAddressByChainId } from "@/config/address/index";
import { GetHistoryOrdersParams, getTradeFlow } from "@/api";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import ERC20Token_ABI from "@/abi/ERC20Token.json";
export class Account {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
  }

  async getWalletQuoteTokenBalance() {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (!config.signer) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidSigner,
        "Invalid signer"
      );
    }
    const contractAddress = getContractAddressByChainId(config.chainId);
    const erc20Contract = new ethers.Contract(
      contractAddress.ERC20,
      ERC20Token_ABI,
      config.signer
    );
    const balance = await erc20Contract.balanceOf(config.signer.getAddress());
    return {
      code: 0,
      data: balance,
    };
  }

  /**
   * get tradable amount
   */
  async getTradableAmount({ poolId }: { poolId: string }) {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (!config.signer) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidSigner,
        "Invalid signer"
      );
    }
    const contractAddress = getContractAddressByChainId(config.chainId);
    const accountContract = new ethers.Contract(
      contractAddress.Account,
      Account_ABI,
      config.signer
    );
    try {
      const assets = await accountContract.getTradableAmount(config.signer.getAddress(), poolId);
      const data = {
        profitIsReleased: assets[0],
        freeAmount: assets[1],
        tradeableProfit: assets[2],
      }
      return {
        code: 0,
        data,
      };
    } catch (error) {
      return {
        code: -1
      }
    }

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
