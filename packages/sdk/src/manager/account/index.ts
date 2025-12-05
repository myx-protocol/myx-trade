import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { Utils } from "../utils";
import { ethers, Signer } from "ethers";
import Account_ABI from "@/abi/Account.json";
import { getContractAddressByChainId } from "@/config/address/index";
import { GetHistoryOrdersParams, getTradeFlow } from "@/api";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import ERC20Token_ABI from "@/abi/ERC20Token.json";
import { getJSONProvider } from "@/web3";
import { getForwarderContract } from "@/web3/providers";
import { MyxClient } from "..";
import dayjs from "dayjs";
export class Account {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private client: MyxClient;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils, client: MyxClient) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.client = client;
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
  async getTradableAmount({ poolId, chainId, address }: { poolId: string, chainId: number, address: string }) {
    const contractAddress = getContractAddressByChainId(chainId);
    const provider = await getJSONProvider(chainId)
    const accountContract = new ethers.Contract(
      contractAddress.Account,
      Account_ABI,
      provider
    );
    try {
      const assets = await accountContract.getTradableAmount(address, poolId);
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

  async getAvailableMarginBalance({ poolId, chainId, address }: { poolId: string, chainId: number, address: string }) {
    const marginAccountBalanceRes = await this.getTradableAmount({ poolId, chainId: chainId, address });
    const marginAccountBalance = marginAccountBalanceRes?.data;
    if (marginAccountBalanceRes.code !== 0) {
      throw new MyxSDKError(
        MyxErrorCode.InsufficientMarginBalance,
        "Insufficient margin balance"
      );
    }
    const availableAccountMarginBalance = BigInt(marginAccountBalance?.freeAmount.toString() ?? 0) + (!marginAccountBalance?.tradeableProfit ? BigInt(marginAccountBalance?.tradeableProfit) : BigInt(0))

    return availableAccountMarginBalance
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


  async withdraw({ chainId, receiver, amount, poolId }: { chainId: number, receiver: string, amount: string, poolId: string }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const contractAddress = getContractAddressByChainId(chainId);

    try {
      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet

      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(receiver)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }
        const forwarderContract = await getForwarderContract(chainId)

        const accountContract = new ethers.Contract(
          contractAddress.Account,
          Account_ABI,
          seamlessWallet as Signer
        );
        const functionHash = accountContract.interface.encodeFunctionData('updateAndWithdraw', [receiver, poolId, true, amount])
        const nonce = await forwarderContract.nonces(seamlessWallet.address)
        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: contractAddress.Account,
          value: '0',
          gas: '350000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("withdraw forward tx params --->", forwardTxParams)

        const rs = await this.client.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);
        console.log('rs-->', rs)

        return {
          code: 0,
          message: "withdraw success",
          data: rs,
        };

      }
      const accountContract = new ethers.Contract(
        contractAddress.Account,
        Account_ABI,
        config.signer
      );

      const rs = await accountContract.updateAndWithdraw(receiver, poolId, true, amount);
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
    const contractAddress = getContractAddressByChainId(chainId);

    try {
      const needApproval = await this.utils.needsApproval(
        chainId,
        tokenAddress,
        amount,
        contractAddress.Account,
      );

      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet

      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(account)

        if (needApproval) {
          const approvalResult = await this.utils.approveAuthorization({
            chainId,
            quoteAddress: tokenAddress,
            amount: ethers.MaxUint256.toString(),
            spenderAddress: contractAddress.Account,
            signer: seamlessWallet as Signer,
          });

          if (approvalResult.code !== 0) {
            throw new Error(approvalResult.message);
          }
        }

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }
        const forwarderContract = await getForwarderContract(chainId)

        const accountContract = new ethers.Contract(
          contractAddress.Account,
          Account_ABI,
          seamlessWallet as Signer
        );
        const functionHash = accountContract.interface.encodeFunctionData('deposit', [account, tokenAddress, amount])
        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: contractAddress.Account,
          value: '0',
          gas: '350000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("deposit forward tx params --->", forwardTxParams)

        const rs = await this.client.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);
        console.log('rs-->', rs)

        return {
          code: 0,
          message: "deposit success",
          data: rs,
        };
      }

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


      const accountContract = new ethers.Contract(
        contractAddress.Account,
        Account_ABI,
        config.signer
      );

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
