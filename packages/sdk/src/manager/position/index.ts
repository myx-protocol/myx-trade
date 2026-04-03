import { ConfigManager, MyxClientConfig } from "../config/index.js";
import { Logger } from "@/logger";

import { GetHistoryOrdersParams } from "@/api";
import { Utils } from "../utils/index.js";
import {  maxUint256 } from "viem";
import { getPublicClient } from "@/web3/viemClients.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { Seamless } from "../seamless/index.js";
import {
  getBrokerSingerContract,
} from "@/web3/providers";
import { Account } from "../account/index.js";
import { Api } from "../api/index.js";
import { TRADE_GAS_LIMIT_RATIO } from "@/config/fee";
import { ChainId } from "@/config/chain";
import { getContractAddressByChainId } from "@/config/address/index.js";

export class Position {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private account: Account;
  private api: Api;
  constructor(
    configManager: ConfigManager,
    logger: Logger,
    utils: Utils,
    account: Account,
    api: Api
  ) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.account = account;
    this.api = api;
  }

  async listPositions(address: string, positionId?: string) {
    // Auto-fetch accessToken; refresh if missing or expired
    const accessToken = await this.configManager.getAccessToken();

    try {
      const res = await this.api.getPositions({
        accessToken: accessToken ?? '',
        address: address,
        positionId: positionId,
      });
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      this.logger.error("Error fetching positions:", error);
      return {
        code: -1,
        message: "Failed to fetch positions",
      };
    }
  }

  async getPositionHistory(params: GetHistoryOrdersParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    const res = await this.api.getPositionHistory(
      { accessToken, ...params, address: address },
    );
    return {
      code: 0,
      data: res.data,
    };
  }

  async adjustCollateral({
    poolId,
    positionId,
    adjustAmount,
    quoteToken,
    chainId,
    address,
  }: {
    poolId: string;
    positionId: string;
    adjustAmount: string;
    quoteToken: string;
    chainId: number;
    address: string;
  }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    try {
      /**
       * fetch oracle price
       */
      const priceData = await this.utils.getOraclePrice(poolId, chainId);
      if (!priceData) {
        throw new Error("Failed to get price data");
      }
      const updateParams = {
        poolId: poolId,
        oracleType: priceData.oracleType,
        publishTime: priceData.publishTime,
        oracleUpdateData: priceData?.vaa ?? "0",
      };

      let needsApproval = false;

      if (Number(adjustAmount) > 0) {
        needsApproval = await this.utils.needsApproval(
          address,
          chainId,
          quoteToken,
          adjustAmount,
          getContractAddressByChainId(chainId).TRADING_ROUTER
        );
      }

      // const authorized =
      //   this.configManager.getConfig().seamlessAccount?.authorized;
      // const seamlessWallet =
      //   this.configManager.getConfig().seamlessAccount?.wallet;

      let depositAmount = BigInt(0);

      const used = BigInt(adjustAmount) > 0 ? BigInt(adjustAmount) : 0n;
      const availableRes = await this.account.getAvailableMarginBalance({
        poolId,
        chainId,
        address,
      });
      const availableAccountMarginBalance = availableRes.code === 0 ? (availableRes.data ?? 0n) : 0n;
      let diff = BigInt(0);
      if (availableAccountMarginBalance < used) {
        diff = used - availableAccountMarginBalance;
        depositAmount = diff;
      }

      const depositData = {
        token: quoteToken,
        amount: depositAmount.toString(),
      };
      
      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      /**
       * call broker contract
       */
      const brokerContract = await getBrokerSingerContract(chainId, config.brokerAddress);

      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId,
          quoteAddress: quoteToken,
          amount: maxUint256.toString(),
          spenderAddress: getContractAddressByChainId(chainId).TRADING_ROUTER,
        });
        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const hash = await brokerContract.write!.updatePriceAndAdjustCollateral(
        [[updateParams], depositData, positionId, adjustAmount],
        {
          value: BigInt(priceData?.value ?? "1"),
          gas: (BigInt(10000000) * TRADE_GAS_LIMIT_RATIO[chainId as ChainId]) / 100n,
        }
      );

      await getPublicClient(chainId).waitForTransactionReceipt({ hash });

      return {
        code: 0,
        data: { hash },
        message: "Adjust collateral transaction submitted",
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }
}
