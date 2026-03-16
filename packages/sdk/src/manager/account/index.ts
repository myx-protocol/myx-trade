import { ConfigManager, MyxClientConfig } from "../config/index.js";
import { Logger } from "@/logger";
import { Utils } from "../utils/index.js";
import { ethers, Signer } from "ethers";
import Account_ABI from "@/abi/Account.json";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { GetHistoryOrdersParams } from "@/api";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import ERC20Token_ABI from "@/abi/ERC20Token.json";
import { getJSONProvider } from "@/web3";
import { getForwarderContract } from "@/web3/providers";
import { AppealStatus, MyxClient } from "../index.js";
import dayjs from "dayjs";
import DataProvider_ABI from "@/abi/DataProvider.json";
import Broker_ABI from "@/abi/Broker.json";

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

  async getWalletQuoteTokenBalance(chainId: number, address?: string) {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (!config.signer) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidSigner,
        "Invalid signer"
      );
    }

    const contractAddress = getContractAddressByChainId(chainId);
    const provider = await getJSONProvider(chainId)
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


  async getAvailableMarginBalance({ poolId, chainId, address }: { poolId: string, chainId: number, address: string }) {
    try {
      const marginAccountBalanceRes = await this.getAccountInfo(chainId, address, poolId);
      if (marginAccountBalanceRes.code !== 0) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          "Failed to get account info"
        );
      }
      const poolAppealStatusRes = await this.client.api.getPoolAppealStatus({ poolId, chainId, address, accessToken: await this.configManager.getAccessToken() ?? '' });

      const marginAccountBalance = marginAccountBalanceRes.data;
      const quoteProfit = BigInt(marginAccountBalance.quoteProfit ?? 0)
      const freeAmount = BigInt((marginAccountBalance?.freeMargin ?? 0))

      const accountMargin = freeAmount + (poolAppealStatusRes.data === AppealStatus.None ? quoteProfit : BigInt(0))

      return accountMargin
    } catch (error) {
      throw new MyxSDKError(
        MyxErrorCode.RequestFailed,
        "Failed to get getAvailableMarginBalance"
      );
    }
  }

  async getTradeFlow(params: GetHistoryOrdersParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    const res = await this.client.api.getTradeFlow({ accessToken, ...params, address });
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
        const isEnoughGas = await this.utils.checkSeamlessGas(receiver, chainId)

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

        const rs = await this.client.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

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
        account,
        chainId,
        tokenAddress,
        amount,
        contractAddress.Account,
      );

      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet

      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(account, chainId)

        // if (needApproval) {
        //   const approvalResult = await this.utils.approveAuthorization({
        //     chainId,
        //     quoteAddress: tokenAddress,
        //     amount: ethers.MaxUint256.toString(),
        //     spenderAddress: contractAddress.Account,
        //     signer: seamlessWallet as Signer,
        //   });

        //   if (approvalResult.code !== 0) {
        //     throw new Error(approvalResult.message);
        //   }
        // }

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

        const rs = await this.client.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

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

  async getAccountVipInfo(chainId: number, address: string) {
    const config: MyxClientConfig = this.configManager.getConfig();


    const provider = await getJSONProvider(chainId)

    const brokerContract = new ethers.Contract(
      config.brokerAddress,
      Broker_ABI,
      provider
    );

    const latestBlock = await provider.getBlock('latest')
    const deadline = (latestBlock?.timestamp ?? dayjs().unix()) + 60 * 5
    const accessToken = await this.configManager.getAccessToken() ?? ''

    try {
      const currentEpoch = await this.client.api.getCurrentEpoch({ address, accessToken, broker: config.brokerAddress });
      if (currentEpoch.code !== 9200) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          currentEpoch.msg ?? "Failed to get current epoch"
        );
      }
      const accountVipInfo = await brokerContract.userFeeData(currentEpoch?.data ?? 0, address);
      const nonce = await brokerContract.userNonces(address);
      return {
        code: 0,
        data: { ...accountVipInfo, nonce: nonce.toString(), deadline },
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async getAccountVipInfoByBackend(address: string, chainId: number, deadline: number, nonce: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    try {
      const res = await this.client.api.getAccountVipInfo({ address, accessToken, chainId, deadline, nonce });
      if (res.code !== 9200) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          res.msg ?? "Failed to get account vip info"
        );
      }
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async setUserFeeData(address: string, chainId: number, deadline: number, params: { tier: number, referrer: string, totalReferralRebatePct: number, referrerRebatePct: number, nonce: string }, signature: string) {
    const config: MyxClientConfig = this.configManager.getConfig();
    const authorized = this.configManager.getConfig().seamlessAccount?.authorized
    const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
    if (deadline < dayjs().unix()) {
      throw new MyxSDKError(
        MyxErrorCode.RequestFailed,
        "Invalid deadline, please try again"
      );
    }

    const feeData = {
      user: address,
      nonce: params.nonce,
      deadline: deadline,
      feeData: {
        tier: params.tier,
        referrer: params.referrer || ethers.ZeroAddress,
        totalReferralRebatePct: params.totalReferralRebatePct,
        referrerRebatePct: params.referrerRebatePct,
      },
      signature: signature,
    }

    try {
      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(address, chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }
        const forwarderContract = await getForwarderContract(chainId)

        const accountContract = new ethers.Contract(
          config.brokerAddress,
          Account_ABI,
          seamlessWallet as Signer
        );
        const functionHash = accountContract.interface.encodeFunctionData('setUserFeeData', [feeData])
        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: config.brokerAddress,
          value: '0',
          gas: '350000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }
        const rs = await this.client.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

        return {
          code: 0,
          data: rs,
        };
      } else {
        const brokerContract = new ethers.Contract(
          config.brokerAddress,
          Broker_ABI,
          config.signer
        );

        const nonce = await brokerContract.userNonces(address);

        if (parseInt(nonce.toString()) + 1 !== parseInt(params.nonce.toString())) {
          throw new MyxSDKError(
            MyxErrorCode.RequestFailed,
            "Invalid nonce, please try again"
          );
        }

        const rs = await brokerContract.setUserFeeData(feeData);
        const receipt = await rs?.wait(1);

        return {
          code: 0,
          data: receipt,
        };
      }




    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }
}
