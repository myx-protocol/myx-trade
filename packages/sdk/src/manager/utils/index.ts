import { ConfigManager, MyxClientConfig } from "../config/index.js";
import { decodeEventLog, maxUint256 } from "viem";
import Emiter_ABI from "@/abi/Emiter.json";
import { getContractAddressByChainId } from "@/config/address/index.js";
import { Logger } from "@/logger";
import { HttpKlineIntervalEnum } from "@/api";
import { getErrorTextFormError } from "@/config/error";
import { customErrorMapping } from "@/config/customErrorMap";
import { KlineResolution } from "../subscription/types/index.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { getPriceData } from "@/lp";

import {
  getDataProviderContract,
  getBrokerContract,
  getMarketManageContract,
  getTokenContract,
  getERC20Contract,
  ProviderType,
} from "@/web3/providers";
import { getPublicClient } from "@/web3/viemClients.js";
import {
  bigintTradingGasPriceWithRatio,
  bigintTradingGasToRatioCalculator,
} from "@/common";
import { CHAIN_INFO } from "@/config/chains/index";
import { executeAddressByChainId } from "@/config/address";

export class Utils {
  private configManager: ConfigManager;
  private logger: Logger;
  constructor(configManager: ConfigManager, logger: Logger) {
    this.configManager = configManager;
    this.logger = logger;
  }

  getOrderIdFromTransaction(receipt: any): string | null {
    if (!receipt || !receipt.logs) {
      return null;
    }

    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      this.logger.info(`Log ${i}:`, { address: log.address, topics: log.topics, data: log.data });
      try {
        const decoded = decodeEventLog({
          abi: Emiter_ABI as never,
          data: (log.data ?? "0x") as `0x${string}`,
          topics: (log.topics ?? []) as [`0x${string}`, ...`0x${string}`[]],
        });
        const args = (decoded as { eventName?: string; args?: { orderId?: unknown } }).args;
        if (decoded.eventName === "OrderPlaced" && args?.orderId != null) {
          return String(args.orderId);
        }
      } catch {
        continue;
      }
    }
    // this.logger.warn("OrderPlaced event not found in transaction logs");
    return null;
  }

  private async getApproveQuoteAmount(
    account: string,
    chainId: number,
    tokenAddress: string,
    spenderAddress?: string
  ) {
    try {
      const spender = spenderAddress ?? getContractAddressByChainId(chainId).Account;
      const tokenContract = getTokenContract(chainId, tokenAddress);
      const allowance = await tokenContract.read.allowance(account as `0x${string}`, spender as `0x${string}`);
      return { code: 0, data: String(allowance) };
    } catch (error) {
      this.logger.error("Error getting allowance:", error);
      throw typeof error === "string" ? error : await getErrorTextFormError(error);
    }
  }

  async needsApproval(
    account: string,
    chainId: number,
    tokenAddress: string,
    requiredAmount: string,
    spenderAddress?: string
  ): Promise<boolean> {
    try {
      const currentAllowanceRes = await this.getApproveQuoteAmount(
        account,
        chainId,
        tokenAddress,
        spenderAddress
      );
      const currentAllowance = currentAllowanceRes.data;
      const allowanceBigInt = BigInt(currentAllowance);
      const requiredBigInt = BigInt(requiredAmount);

      const needsApproval = allowanceBigInt < requiredBigInt;

      return needsApproval;
    } catch (error) {
      this.logger.error("Error checking approval needs:", error);
      return true;
    }
  }

  async approveAuthorization({
    chainId,
    quoteAddress,
    amount,
    spenderAddress,
  }: {
    chainId: number;
    quoteAddress: string;
    amount?: string;
    spenderAddress?: string;
    signer?: unknown;
  }) {
    try {
      const contract = await getERC20Contract(chainId, quoteAddress);
      const approveAmount = amount ?? maxUint256;
      const spender = spenderAddress ?? getContractAddressByChainId(chainId).Account;
      const gasPrice = await this.getGasPriceByRatio();
      const hash = await contract.write!.approve([spender as `0x${string}`, approveAmount], { gasPrice });
      const client = getPublicClient(chainId);
      await client.waitForTransactionReceipt({ hash });
      return { code: 0, message: "Approval success" };
    } catch (error) {
      this.logger.error("Approval error:", error);
      return { code: -1, message: (error as Error)?.message };
    }
  }

  async getUserTradingFeeRate(
    assetClass: number,
    riskTier: number,
    chainId: number
  ): Promise<
    | { code: 0; data: { takerFeeRate: string; makerFeeRate: string; baseTakerFeeRate: string; baseMakerFeeRate: string } }
    | { code: -1; message: string }
  > {
    const config: MyxClientConfig = this.configManager.getConfig();
    const brokerAddress = config.brokerAddress;

    try {
      const brokerContract = getBrokerContract(chainId, brokerAddress);
      const targetAddress = config.seamlessMode
        ? config.seamlessAccount?.masterAddress
        : await this.configManager.getSignerAddress(chainId);

      const userFeeRate = await brokerContract.read.getUserFeeRate(
        targetAddress as `0x${string}`,
        assetClass,
        riskTier
      );

      return {
        code: 0,
        data: {
          takerFeeRate: userFeeRate[0].toString(),
          makerFeeRate: userFeeRate[1].toString(),
          baseTakerFeeRate: userFeeRate[2].toString(),
          baseMakerFeeRate: userFeeRate[3].toString(),
        },
      };
    } catch (error) {
      this.logger.error("Error getting user trading fee rate:", error);
      return {
        code: -1,
        message: (error as Error)?.message ?? "Unknown error",
      };
    }
  }

  async getNetworkFee(marketId: string, chainId: number) {
    try {
      const marketManagerContract = await getMarketManageContract(chainId, ProviderType.JSON);
      const networkFee = await marketManagerContract.read.getExecutionFee(marketId as `0x${string}`);
      return networkFee.toString();
    } catch (error) {
      this.logger.error("Error getting network fee:", error);
      return "0";
    }
  }

  async getOraclePrice(poolId: string, chainId: number) {
    try {
      const priceData = await getPriceData(chainId, poolId);
      if (!priceData) throw new Error("Failed to get price data");
      return priceData;
    } catch (error) {
      this.logger.error("Error getting oracle price:", error);
      throw error;
    }
  }

  async buildUpdatePriceParams(poolId: string, chainId: number) {
    const priceData = await this.getOraclePrice(poolId, chainId);
    if (!priceData) throw new Error("Failed to get price data");
    return [
      {
        poolId: poolId,
        oracleUpdateData: priceData.vaa,
        publishTime: priceData.publishTime,
        oracleType: priceData.oracleType,
        value: priceData.value,
        price: priceData.price,
      },
    ];
  }

  transferKlineResolutionToInterval(resolution: KlineResolution) {
    switch (resolution) {
      case "1m":
        return HttpKlineIntervalEnum.Minute1;
      case "5m":
        return HttpKlineIntervalEnum.Minute5;
      case "15m":
        return HttpKlineIntervalEnum.Minute15;
      case "30m":
        return HttpKlineIntervalEnum.Minute30;
      case "1h":
        return HttpKlineIntervalEnum.Hour1;
      case "4h":
        return HttpKlineIntervalEnum.Hour4;
      case "1d":
        return HttpKlineIntervalEnum.Day1;
      case "1w":
        return HttpKlineIntervalEnum.Week1;
      case "1M":
        return HttpKlineIntervalEnum.Month1;
      default:
        throw new MyxSDKError(
          MyxErrorCode.ParamError,
          `Invalid kline resolution: ${resolution}`
        );
    }
  }

  async getErrorMessage(error: any, fallbackErrorMessage = "Unknown error") {
    try {
      if (typeof error === "string") {
        return error;
      }
      if (error instanceof MyxSDKError) {
        return error.message;
      }

      const errorText = await getErrorTextFormError(error);
      if (errorText) {
        return errorText.error;
      }

      return JSON.stringify(error);
    } catch (error: any) {
      return error?.message ?? error?.toString() ?? fallbackErrorMessage;
    }
  }

  async checkSeamlessGas(userAddress: string, chainId: number) {
    const marketManagerContract = await getMarketManageContract(chainId, ProviderType.JSON);
    const forwardFeeToken = executeAddressByChainId(chainId);
    const relayFee = await marketManagerContract.read.getForwardFeeByToken(forwardFeeToken as `0x${string}`);
    const contractAddress = getContractAddressByChainId(chainId);
    const tokenContract = getTokenContract(chainId, contractAddress.ERC20);
    const balance = await tokenContract.read.balanceOf(userAddress as `0x${string}`);
    if (BigInt(relayFee) > 0n && BigInt(balance) < BigInt(relayFee)) return false;
    return true;
  }

  async getLiquidityInfo({
    chainId,
    poolId,
    marketPrice,
  }: {
    chainId: number;
    poolId: string;
    marketPrice: string;
  }) {
    try {
      const dataProviderContract = await getDataProviderContract(chainId, ProviderType.JSON);
      // viem 的 read 方法要求参数必须用数组传入，否则会报 AbiEncodingLengthMismatchError (Given length: 0)
      const poolInfo = await dataProviderContract.read.getPoolInfo([poolId as `0x${string}`, marketPrice]);
      return { code: 0, data: poolInfo };
    } catch (error) {
      this.logger.error("Error getting pool info:", error);
      return { code: -1, message: (error as Error)?.message };
    }
  }

  formatErrorMessage(error: any) {
    if (typeof error === "string") {
      return error;
    }
    if (error instanceof MyxSDKError) {
      return error.message;
    }

    // Handle user rejected transaction
    if (
      error?.code === "ACTION_REJECTED" ||
      error?.code === 4001 ||
      error?.info?.error?.code === 4001 ||
      (typeof error?.message === "string" &&
        (error.message.toLowerCase().includes("user rejected") ||
          error.message.toLowerCase().includes("denied")))
    ) {
      return "User Rejected";
    }

    // Try to parse custom error selector
    // First try to get from error.data
    let errorData = error?.data;

    // If error.data is missing, try to extract data from error.message
    if (!errorData && error?.message && typeof error.message === "string") {
      // Match data="0x..." format
      const dataMatch = error.message.match(/data=["'](0x[0-9a-fA-F]+)["']/i);
      if (dataMatch && dataMatch[1]) {
        errorData = dataMatch[1];
      }
    }

    if (errorData) {
      // Extract selector (first 10 chars: 0x + 8 hex chars)
      const selector =
        typeof errorData === "string" && errorData.startsWith("0x")
          ? errorData.slice(0, 10).toLowerCase()
          : null;

      if (selector) {
        // Look up in error mapping
        const errorKey = Object.keys(customErrorMapping).find(
          (k) => k.toLowerCase() === selector
        );
        if (errorKey) {
          return customErrorMapping[errorKey];
        }
      }
    }

    // Try to extract info from error.reason or error.message
    if (error?.reason) {
      return error.reason;
    }
    if (error?.message) {
      return error.message;
    }

    return JSON.stringify(error);
  }

  async getGasPriceByRatio() {
    const chainId = this.configManager.getConfig().chainId;
    return (await bigintTradingGasPriceWithRatio(chainId)).gasPrice;
  }

  async getGasLimitByRatio(gasLimit: bigint) {
    const chainId = this.configManager.getConfig().chainId;
    const chainInfo = CHAIN_INFO[chainId];
    return bigintTradingGasToRatioCalculator(
      gasLimit,
      chainInfo?.gasLimitRatio ?? 1.3
    );
  }
}
