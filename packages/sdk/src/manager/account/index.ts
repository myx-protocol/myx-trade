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
import DataProvider_ABI from "@/abi/DataProvider.json";
import { getPoolList } from "@/api/pool";
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
    try {
      const poolListRes = await getPoolList();
      if (poolListRes.code !== 9200) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          "Failed to get pool list"
        );
      }
      const poolList = poolListRes.data;
      const pool = poolList?.find((pool: any) => pool.poolId === poolId);
      const orderRes = await this.client.order.getOrders();
      if (orderRes.code !== 0) {

        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          "Failed to get orders"
        );
      }
      const orders = orderRes.data;
      const openOrders = orders?.filter((order: any) => order.poolId === poolId);
      const used = openOrders?.reduce((acc: string, order: any) => {
        const prev = BigInt(ethers.parseUnits(acc, pool?.quoteDecimals ?? 6))
        const curr = BigInt(ethers.parseUnits(order.collateralAmount ?? '0', pool?.quoteDecimals ?? 6)) + prev
        return curr.toString();
      }, '0');


      const marginAccountBalanceRes = await this.getAccountInfo(chainId, address, poolId);
      if (marginAccountBalanceRes.code !== 0) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          "Failed to get account info"
        );
      }

      const marginAccountBalance = marginAccountBalanceRes.data;
      const usedMargin = BigInt(used ?? '0');
      const quoteProfit = BigInt(marginAccountBalance.quoteProfit ?? 0)
      const freeAmount = BigInt((marginAccountBalance?.freeMargin ?? 0))

      const accountMargin = freeAmount + quoteProfit


      if (accountMargin < usedMargin) {
        return BigInt(0)
      }

      const availableAccountMarginBalance = accountMargin - usedMargin;

      return availableAccountMarginBalance
    } catch (error) {
      this.logger.info('getAvailableMarginBalance error-->', error)
      throw new MyxSDKError(
        MyxErrorCode.RequestFailed,
        "Failed to get getAvailableMarginBalance"
      );
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

  async withdraw({ chainId, receiver, amount, poolId, isQuoteToken }: { chainId: number, receiver: string, amount: string, poolId: string, isQuoteToken: boolean }) {
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

      const rs = await accountContract.updateAndWithdraw(receiver, poolId, isQuoteToken, amount);
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

  async getAccountInfo(chainId: number, address: string, poolId: string) {
    const contractAddress = getContractAddressByChainId(chainId);
    const provider = await getJSONProvider(chainId)
    const dataProviderContract = new ethers.Contract(
      contractAddress.DATA_PROVIDER,
      DataProvider_ABI,
      provider
    );
    try {
      const accountInfo = await dataProviderContract.getAccountInfo(poolId, address);
      return {
        code: 0,
        data: accountInfo,
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }
}
