import { ConfigManager, MyxClientConfig } from "../config/index.js";
import { Logger } from "@/logger";
import { Utils } from "../utils/index.js";
import { maxUint256, zeroAddress } from "viem";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { getTokenContract, getDataProviderContract, getBrokerContract, getAccountContract, getBrokerSingerContract } from "@/web3/providers";
import { getPublicClient } from "@/web3/viemClients.js";
import { AppealStatus, MyxClient } from "../index.js";
import dayjs from "dayjs";

import { AccountInfo } from "@/types/common.js";
import { GetHistoryOrdersParams } from "@/api/index.js";

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

  /** Retry an async call a few times to tolerate intermittent RPC/decoding failures (e.g. BAD_DATA / 0x). */
  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 300): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (e) {
        lastErr = e;
        if (i < retries - 1) await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  }

  async getTradeFlow(params: GetHistoryOrdersParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    const res = await this.client.api.getTradeFlow({ accessToken, ...params, address });
    return {
      code: 0,
      data: res.data,
    };
  }

  async getWalletQuoteTokenBalance({ chainId, address, tokenAddress }: { chainId: number, address?: string, tokenAddress: string }) {
    if (!this.configManager.hasSigner()) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidSigner,
        "Invalid signer"
      );
    }

    const tokenContract = getTokenContract(chainId, tokenAddress);
    const signerAddress = await this.configManager.getSignerAddress(chainId);
    const balance = await tokenContract.read.balanceOf([address || signerAddress as `0x${string}`]);
    return {
      code: 0,
      data: balance,
    };
  }

  async updateAndWithdraw(receiver: string, poolId: string, isQuoteToken: boolean, amount: string, chainId: number) {
    try {
      const accountContract = await getAccountContract(chainId);
      const hash = await accountContract.write!.updateAndWithdraw([receiver, poolId, isQuoteToken, amount]);
      const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });

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

  async deposit({ amount, tokenAddress, chainId }: { amount: string; tokenAddress: string; chainId: number }) {
    const account = this.configManager.hasSigner() ? await this.configManager.getSignerAddress(chainId) : "";
    const contractAddress = getContractAddressByChainId(chainId);

    try {
      const needApproval = await this.utils.needsApproval(
        account,
        chainId,
        tokenAddress,
        amount,
        contractAddress.Account,
      );
      if (needApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId,
          quoteAddress: tokenAddress,
          amount: maxUint256.toString(),
          spenderAddress: contractAddress.Account,
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const accountContract = await getAccountContract(chainId);
      const hash = await accountContract.write!.deposit([account, tokenAddress, amount]);
      const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });

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

  async getAvailableMarginBalance({ poolId, chainId, address }: { poolId: string; chainId: number; address: string }) {
    try {
      const marginAccountBalanceRes = await this.getAccountInfo(chainId, address, poolId);
      if (marginAccountBalanceRes.code !== 0) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          "Failed to get account info"
        );
      }
      const poolAppealStatusRes = await this.client.appeal.getAppealStatus(poolId, chainId, address);

      const marginAccountBalance = marginAccountBalanceRes.data;
      const quoteProfit = BigInt(marginAccountBalance?.quoteProfit ?? 0);
      const freeAmount = BigInt(marginAccountBalance?.freeMargin ?? 0);
      const lockedMargin = BigInt((marginAccountBalance as any)?.lockedMargin ?? 0);
      const appealData = poolAppealStatusRes?.code === 0 ? (poolAppealStatusRes.data as any) : null;
      const appealLockedMargin =
        appealData?.status === AppealStatus.isAppealing ? BigInt(appealData?.lockedMargin ?? 0) : 0n;

      const availableMarginBalance = freeAmount + quoteProfit - lockedMargin - appealLockedMargin;

      return {
        code: 0,
        data: availableMarginBalance,
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async getAccountInfo(
    chainId: number,
    address: string,
    poolId: string
  ): Promise<{ code: 0; data: AccountInfo } | { code: -1; message: string }> {
    const dataProviderContract = await getDataProviderContract(chainId);
    try {
      const accountInfo = await dataProviderContract.read.getAccountInfo([poolId as `0x${string}`, address as `0x${string}`]);
      return {
        code: 0,
        data: accountInfo as AccountInfo,
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

    const brokerContract = getBrokerContract(chainId, config.brokerAddress);
    const publicClient = getPublicClient(chainId);
    const latestBlock = await publicClient.getBlock({ blockTag: "latest" });
    const deadline = Number(latestBlock?.timestamp ?? BigInt(dayjs().unix())) + 60 * 5;

    try {

      let nonce: bigint;
      try {
        nonce = await this.withRetry(() => brokerContract.read.userNonces([address as `0x${string}`]));
      } catch {
        nonce = 0n;
      }
      return {
        code: 0,
        data: { nonce: nonce.toString(), deadline },
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async getAccountVipInfoByBackend(address: string, chainId: number, deadline: number, nonce: string) {
    const accessToken = (await this.configManager.getAccessToken()) ?? "";

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


  async setUserFeeData(
    address: string,
    chainId: number,
    deadline: number,
    params: { tier: number; referrer: string; totalReferralRebatePct: number; referrerRebatePct: number; nonce: string, expiry: number },
    signature: string
  ) {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (deadline < dayjs().unix()) {
      throw new MyxSDKError(
        MyxErrorCode.RequestFailed,
        "Invalid deadline, please try again"
      );
    }


    try {
      const brokerContract = await getBrokerSingerContract(chainId, config.brokerAddress);

      const feeData = {
        user: address,
        nonce: params.nonce,
        deadline: deadline,
        feeData: {
          tier: params.tier,
          referrer: params.referrer || zeroAddress,
          totalReferralRebatePct: params.totalReferralRebatePct,
          referrerRebatePct: params.referrerRebatePct,
          expiry: params.expiry
        },

        signature: signature,
      };

      const nonce: bigint = await brokerContract.read.userNonces([address as `0x${string}`]);

      if (parseInt(nonce.toString()) + 1 !== parseInt(params.nonce.toString())) {
        throw new MyxSDKError(
          MyxErrorCode.RequestFailed,
          "Invalid nonce, please try again"
        );
      }

      const hash = await brokerContract.write!.setUserFeeData([feeData]);
      const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });

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
