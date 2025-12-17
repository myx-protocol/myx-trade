import { ConfigManager, MyxClientConfig } from "../config";

import { ethers } from "ethers";
import Emiter_ABI from "@/abi/Emiter.json";
import { getContractAddressByChainId } from "@/config/address/index";
import OrderManager_ABI from "@/abi/OrderManager.json";
import { Logger } from "@/logger";
import { HttpKlineIntervalEnum } from "@/api";
import { getErrorTextFormError } from "@/config/error";
import { KlineResolution } from "../subscription/types";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { getPriceData } from "@/lp";
import Broker_ABI from "@/abi/Broker.json";
import { getDataProviderContract, getForwarderContract } from "@/web3/providers";
import { getJSONProvider } from "@/web3";
import ERC20Token_ABI from "@/abi/ERC20Token.json";

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

    // 创建 Emiter 合约的接口来解析事件
    const emiterInterface = new ethers.Interface(Emiter_ABI);

    // 查找 OrderPlaced 事件定义
    const orderPlacedEvent = Emiter_ABI.find(
      (item: any) => item.type === "event" && item.name === "OrderPlaced"
    );

    if (!orderPlacedEvent) {
      this.logger.error("OrderPlaced event not found in Emiter ABI");
      return null;
    }

    // 计算 OrderPlaced 事件的 topic hash
    const eventTopic = ethers.id(
      "OrderPlaced(address,address,bytes32,uint256,uint256,uint8,uint8,uint8,uint8,uint256,uint256,uint256,uint8,bool,uint16,address,uint256,uint16)"
    );

    this.logger.info("Looking for OrderPlaced events with topic:", eventTopic);

    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];

      this.logger.info(`Log ${i}:`, {
        address: log.address,
        topics: log.topics,
        data: log.data,
      });

      // 检查是否是 OrderPlaced 事件
      if (log.topics && log.topics.length > 0 && log.topics[0] === eventTopic) {
        this.logger.info(`Found OrderPlaced event in log ${i}`);

        try {
          // 使用 ethers 解析事件数据
          const parsedLog = emiterInterface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          if (parsedLog && parsedLog.name === "OrderPlaced") {
            this.logger.info("Parsed OrderPlaced event:", parsedLog.args);

            // 根据 Emiter.json 的定义，orderId 是第5个参数（索引4）
            // 事件字段顺序：broker, user, poolId, positionId, orderId, ...
            const orderId = parsedLog.args[4]; // orderId 在索引 4

            if (orderId !== undefined && orderId !== null) {
              const orderIdString = orderId.toString();
              this.logger.info(`Found orderId: ${orderIdString}`);
              return orderIdString;
            }
          }
        } catch (error) {
          this.logger.error(`Error parsing log ${i}:`, error);
          continue;
        }
      }
    }
    this.logger.warn("OrderPlaced event not found in transaction logs");
    return null;
  }

  private async getApproveQuoteAmount(
    chainId: number,
    quoteAddress: string,
    spenderAddress?: string
  ) {
    try {
      const erc20Abi = [
        "function allowance(address owner, address spender) external view returns (uint256)",
      ];

      const config: MyxClientConfig = this.configManager.getConfig();
      if (!config.signer) {
        throw new MyxSDKError(
          MyxErrorCode.InvalidSigner,
          "Invalid signer"
        );
      }

      const owner = await config.signer.getAddress();

      const spender =
        spenderAddress ??
        getContractAddressByChainId(chainId).Account;

      const provider = await getJSONProvider(chainId)
      const tokenContract = new ethers.Contract(
        quoteAddress,
        erc20Abi,
        provider
      );

      const allowance = await tokenContract.allowance(owner, spender);

      return {
        code: 0,
        data: allowance.toString(),
      };
    } catch (error) {
      this.logger.error("Error getting allowance:", error);
      throw typeof error === "string"
        ? error
        : await getErrorTextFormError(error);
    }
  }

  async needsApproval(
    chainId: number,
    quoteAddress: string,
    requiredAmount: string,
    spenderAddress?: string
  ): Promise<boolean> {
    try {
      const currentAllowanceRes = await this.getApproveQuoteAmount(
        chainId,
        quoteAddress,
        spenderAddress
      );
      const currentAllowance = currentAllowanceRes.data;
      const allowanceBigInt = ethers.getBigInt(currentAllowance);
      const requiredBigInt = ethers.getBigInt(requiredAmount);

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
    signer
  }: {
    chainId: number;
    quoteAddress: string;
    amount?: string;
    spenderAddress?: string;
    signer?: ethers.Signer;
  }) {
    try {
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
      ];

      const config: MyxClientConfig = this.configManager.getConfig();
      const usdcContract = new ethers.Contract(
        quoteAddress,
        erc20Abi,
        signer ?? config.signer
      );
      const approveAmount = amount ?? ethers.MaxUint256;
      const spender =
        spenderAddress ??
        getContractAddressByChainId(chainId).Account;
      const tx = await usdcContract.approve(spender, approveAmount);
      await tx.wait();
      return {
        code: 0,
        message: "Approval success",
      };
    } catch (error) {
      this.logger.error("Approval error:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async getUserTradingFeeRate(assetClass: number, riskTier: number) {
    const config: MyxClientConfig = this.configManager.getConfig();
    const brokerAddress = config.brokerAddress;

    try {
      const provider = await getJSONProvider(config.chainId)
      const brokerContract = new ethers.Contract(
        brokerAddress,
        Broker_ABI,
        provider
      )
      const targetAddress = config.seamlessMode ? config.seamlessAccount?.masterAddress : config.signer?.getAddress()

      const userFeeRate = await brokerContract.getUserFeeRate(
        targetAddress,
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
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async getNetworkFee(quoteAddress: string, chainId: number) {
    const orderManagerAddress = getContractAddressByChainId(
      chainId,
    ).ORDER_MANAGER;
    const provider = await getJSONProvider(chainId)
    const orderManagerContract = new ethers.Contract(
      orderManagerAddress,
      OrderManager_ABI,
      provider
    );

    try {
      const networkFee = await orderManagerContract.getExecutionFee(
        quoteAddress
      );

      console.log("networkFee-->", networkFee.toString());
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
      return {
        price: "0",
        vaa: "",
        publishTime: 0,
        poolId: "",
        value: 0,
      };
    }
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

  async checkSeamlessGas(userAddress: string) {
    const config = this.configManager.getConfig();
    const forwarderContract = await getForwarderContract(config.chainId);
    const relayFee = await forwarderContract.getRelayFee()
    const provider = await getJSONProvider(config.chainId)
    // const { gasPrice } = await provider.getFeeData()
    const contractAddress = getContractAddressByChainId(config.chainId);

    const erc20Contract = new ethers.Contract(
      contractAddress.ERC20,
      ERC20Token_ABI,
      provider
    );
    const balance = await erc20Contract.balanceOf(userAddress);

    if (BigInt(relayFee) > BigInt(0) && BigInt(balance) < BigInt(relayFee)) {
      return false
    }

    return true
  }

  async getLiquidityInfo({
    chainId, poolId, marketPrice
  }: {
    chainId: number;
    poolId: string;
    marketPrice: string;
  }) {
    try {
      const dataProviderContract = await getDataProviderContract(chainId);
      const poolInfo = await dataProviderContract.getPoolInfo(poolId, marketPrice);

      return {
        code: 0,
        data: poolInfo,
      };
    } catch (error) {
      this.logger.error("Error getting pool info:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }
}
