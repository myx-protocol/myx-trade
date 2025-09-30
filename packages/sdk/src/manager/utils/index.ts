import { ConfigManager, MyxClientConfig } from "../config";

import { ethers } from "ethers";
import Emiter_ABI from "@/abi/Emiter.json";
import { getContractAddressByChainId } from "@/config/address/index";
import OrderManager_ABI from "@/abi/OrderManager.json";
import { Logger } from "@/logger";

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

  private async getApproveQuoteAmount(quoteAddress: string) {
    try {
      const erc20Abi = [
        "function allowance(address owner, address spender) external view returns (uint256)",
      ];

      const config: MyxClientConfig = this.configManager.getConfig();

      const owner = await config.signer.getAddress();

      const spenderAddress = getContractAddressByChainId(
        config.chainId
      ).ORDER_MANAGER;

      const tokenContract = new ethers.Contract(
        quoteAddress,
        erc20Abi,
        config.signer
      );

      const allowance = await tokenContract.allowance(owner, spenderAddress);

      return {
        code: 0,
        data: allowance.toString(),
      };
    } catch (error) {
      this.logger.error("Error getting allowance:", error);
      throw error;
    }
  }

  async needsApproval(
    quoteAddress: string,
    requiredAmount: string
  ): Promise<boolean> {
    try {
      const currentAllowanceRes = await this.getApproveQuoteAmount(
        quoteAddress
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
    quoteAddress,
    amount,
  }: {
    quoteAddress: string;
    amount?: string;
  }) {
    try {
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
      ];

      const config: MyxClientConfig = this.configManager.getConfig();
      const usdcContract = new ethers.Contract(
        quoteAddress,
        erc20Abi,
        config.signer
      );
      const approveAmount = amount ?? ethers.MaxUint256;
      const spenderAddress = getContractAddressByChainId(
        config.chainId
      ).ORDER_MANAGER;
      const tx = await usdcContract.approve(spenderAddress, approveAmount);
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

  async getNetworkFee(quoteAddress: string) {
    const config: MyxClientConfig = this.configManager.getConfig();
    const orderManagerAddress = getContractAddressByChainId(
      config.chainId
    ).ORDER_MANAGER;
    const orderManagerContract = new ethers.Contract(
      orderManagerAddress,
      OrderManager_ABI,
      config.signer
    );

    try {
      const networkFee = await orderManagerContract.getExecutionFee(quoteAddress);

      console.log("networkFee-->", networkFee.toString());
      return networkFee.toString();
    } catch (error) {
      this.logger.error("Error getting network fee:", error);
      return "0";
    }

  }
}
