import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { ethers, Signer } from "ethers";
import {
  GetHistoryOrdersParams,
  OracleType,
} from "@/api";
import { Utils } from "../utils";
import brokerAbi from "@/abi/Broker.json";
import { getContract } from "@/web3";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { Seamless } from "../seamless";
import {
  getForwarderContract,
  getSeamlessBrokerContract,
} from "@/web3/providers";
import dayjs from "dayjs";
import { Account } from "../account";
import { Api } from "../api";
import { TRADE_GAS_LIMIT_RATIO } from "@/config/fee";
import { ChainId } from "@/config/chain";
import { getContractAddressByChainId } from "@/config/address/index";

export class Position {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private seamless: Seamless;
  private account: Account;
  private api: Api;
  constructor(
    configManager: ConfigManager,
    logger: Logger,
    utils: Utils,
    seamless: Seamless,
    account: Account,
    api: Api
  ) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.seamless = seamless;
    this.account = account;
    this.api = api;
  }

  async listPositions(address: string) {
    // 自动获取 accessToken，如果没有或过期会自动刷新
    const accessToken = await this.configManager.getAccessToken();

    try {
      const res = await this.api.getPositions(accessToken ?? '', address);
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      console.error("Error fetching positions:", error);
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
    poolOracleType,
    chainId,
    address,
  }: {
    poolId: string;
    positionId: string;
    adjustAmount: string;
    quoteToken: string;
    poolOracleType: OracleType;
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
        oracleType: poolOracleType,
        oracleUpdateData: priceData?.vaa ?? "0",
        publishTime: priceData.publishTime,
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

      const authorized =
        this.configManager.getConfig().seamlessAccount?.authorized;
      const seamlessWallet =
        this.configManager.getConfig().seamlessAccount?.wallet;

      let depositAmount = BigInt(0);

      const used = BigInt(adjustAmount) > 0 ? BigInt(adjustAmount) : 0n;
      const availableAccountMarginBalance =
        await this.account.getAvailableMarginBalance({
          poolId,
          chainId,
          address,
        });
      let diff = BigInt(0);
      if (availableAccountMarginBalance < used) {
        diff = used - availableAccountMarginBalance;
        depositAmount = diff;
      }

      const depositData = {
        token: quoteToken,
        amount: depositAmount.toString(),
      };

      if (config.seamlessMode && authorized && seamlessWallet) {
        // if (needsApproval) {
        //   const approvalResult = await this.utils.approveAuthorization({
        //     chainId: chainId,
        //     quoteAddress: quoteToken,
        //     amount: ethers.MaxUint256.toString(),
        //     signer: seamlessWallet as Signer,
        //   });

        //   if (approvalResult.code !== 0) {
        //     throw new Error(approvalResult.message);
        //   }
        // }

        const isEnoughGas = await this.utils.checkSeamlessGas(
          config.seamlessAccount?.masterAddress as string,
          chainId
        );

        if (!isEnoughGas) {
          throw new MyxSDKError(
            MyxErrorCode.InsufficientBalance,
            "Insufficient relay fee"
          );
        }

        const forwarderContract = await getForwarderContract(chainId);

        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        const functionHash = brokerContract.interface.encodeFunctionData(
          "updatePriceAndAdjustCollateral",
          [[updateParams], depositData, positionId, adjustAmount]
        );

        const nonce = await forwarderContract.nonces(seamlessWallet.address);

        const forwardTxParams = {
          from: seamlessWallet.address ?? "",
          to: this.configManager.getConfig().brokerAddress,
          value: (priceData?.value ?? "1").toString(),
          gas: "10000000",
          deadline: dayjs().add(60, "minute").unix(),
          data: functionHash,
          nonce: nonce.toString(),
        };

        this.logger.info(
          "adjust collateral forward tx params --->",
          forwardTxParams
        );

        const rs = await this.seamless.forwarderTx(
          forwardTxParams,
          chainId,
          seamlessWallet as Signer
        );

        return {
          code: 0,
          message: "adjust collateral success",
          data: rs,
        };
      }

      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      /**
       * call broker contract
       */
      const brokerContract = getContract(
        config.brokerAddress,
        brokerAbi,
        config.signer
      );

      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId,
          quoteAddress: quoteToken,
          amount: ethers.MaxUint256.toString(),
          spenderAddress: getContractAddressByChainId(chainId).TRADING_ROUTER,
        });
        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const transaction = await brokerContract.updatePriceAndAdjustCollateral(
        [updateParams],
        depositData,
        positionId,
        adjustAmount,
        {
          value: BigInt(priceData?.value ?? "1"),
          gas: (BigInt(10000000) * TRADE_GAS_LIMIT_RATIO[chainId as ChainId]) / 100n,
        }
      );

      const hash = await transaction.wait();

      return {
        code: 0,
        data: { hash },
        message: "Adjust collateral transaction submitted",
      };
    } catch (error) {
      console.log(error, "error");
      const errorMessage = await this.utils.getErrorMessage(error);
      this.logger.error("adjustCollateral error-->", errorMessage);
      return {
        code: -1,
        message: errorMessage,
      };
    }
  }
}
