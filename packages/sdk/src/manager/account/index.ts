import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { Utils } from "../utils";
import { ethers } from "ethers";
import Account_ABI from "@/abi/Account.json";
import { getContractAddressByChainId } from "@/config/address/index";
import { GetHistoryOrdersParams, getTradeFlow } from "@/api";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import ERC20Token_ABI from "@/abi/ERC20Token.json";
import { getJSONProvider } from "@/web3";
export class Account {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
  }

  async getWalletQuoteTokenBalance(address?: string) {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (!config.signer) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidSigner,
        "Invalid signer"
      );
    }

    const contractAddress = getContractAddressByChainId(config.chainId);
    const provider = await getJSONProvider(config.chainId)
    const erc20Contract = new ethers.Contract(
      contractAddress.ERC20,
      ERC20Token_ABI,
      provider
    );
    const balance = await erc20Contract.balanceOf(address || config.signer.getAddress());
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
    const provider = await getJSONProvider(config.chainId)
    const accountContract = new ethers.Contract(
      contractAddress.Account,
      Account_ABI,
      provider
    );
    try {
      const targetAddress = config.seamlessMode ? config.seamlessAccount?.masterAddress : config.signer?.getAddress()
      const assets = await accountContract.getTradableAmount(targetAddress, poolId);
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


  async withdraw({ chainId, receiver, tokenAddress, amount }: { chainId: number, receiver: string, tokenAddress: string, amount: string }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const contractAddress = getContractAddressByChainId(chainId);
    const accountContract = new ethers.Contract(
      contractAddress.Account,
      Account_ABI,
      config.signer
    );

    try {

      const rs = await accountContract.withdraw(receiver, tokenAddress, amount);
      const receipt = await rs?.wait(1);

      return {
        code: 0,
        data: receipt,
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async deposit({ amount, tokenAddress, chainId }: { amount: string, tokenAddress: string, chainId: number }) {
    const config: MyxClientConfig = this.configManager.getConfig();
    const account = await config.signer?.getAddress() ?? ''
    const contractAddress = getContractAddressByChainId(config.chainId);
    const accountContract = new ethers.Contract(
      contractAddress.Account,
      Account_ABI,
      config.signer
    );

    try {
      const needApproval = await this.utils.needsApproval(
        chainId,
        tokenAddress,
        amount,
        contractAddress.Account,
      );

      if (needApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId,
          quoteAddress: tokenAddress,
          amount: ethers.MaxUint256.toString(),
          spenderAddress: contractAddress.Account,
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const rs = await accountContract.deposit(account, tokenAddress, amount);
      const receipt = await rs?.wait(1);

      return {
        code: 0,
        data: receipt,
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }
}
