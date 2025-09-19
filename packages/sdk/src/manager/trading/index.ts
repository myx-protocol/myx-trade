import { PlaceOrderParams } from "@/types/type";
import { getBrokerSingerContract } from "@/web3/providers";
import { ConfigManager, MyxClientConfig } from "../config";
import { TIME_IN_FORCE } from "@/config/con";
import { ethers } from "ethers";
import { getContractAddressByChainId } from "@/config/address/index";
import Broker_ABI from "@/abi/Broker.json";

export class Trading {
  private configManager: ConfigManager;
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  private getOrderIdFromTransaction(receipt: any): string | null {
    const ORDER_PLACED_TOPIC =
      "0xf6b9bfc100eeb47bf64644320e71b858b32880d5028e935db0e717302fa5b564";

    if (!receipt || !receipt.logs) {
      return null;
    }

    const iface = new ethers.Interface(Broker_ABI);

    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];

      if (
        log.topics &&
        log.topics.length > 0 &&
        log.topics[0] === ORDER_PLACED_TOPIC
      ) {
        try {
          let orderId = null;

          for (let j = 1; j < log.topics.length; j++) {
            const topicValue = log.topics[j];

            try {
              const bigIntValue = ethers.getBigInt(topicValue);
              const numberValue = bigIntValue.toString();

              if (bigIntValue > 0n && bigIntValue < 10000000000n) {
                if (!orderId) {
                  orderId = numberValue;
                }
              }
            } catch (e) {}
          }

          if (log.data && log.data !== "0x") {
            const dataWithoutPrefix = log.data.slice(2); // 移除 '0x'

            const numParams = Math.floor(dataWithoutPrefix.length / 64);

            for (let k = 0; k < numParams; k++) {
              const start = k * 64;
              const paramHex =
                "0x" + dataWithoutPrefix.slice(start, start + 64);

              try {
                const bigIntValue = ethers.getBigInt(paramHex);
                const numberValue = bigIntValue.toString();

                if (bigIntValue > 0n && bigIntValue < 10000000000n) {
                  if (!orderId) {
                    orderId = numberValue;
                  }
                }
              } catch (e) {}
            }
          }

          if (!orderId) {
            for (let j = 1; j < log.topics.length; j++) {
              try {
                const bigIntValue = ethers.getBigInt(log.topics[j]);
                if (bigIntValue > 10000000000n) {
                  const numberValue = bigIntValue.toString();
                  if (!orderId) {
                    orderId = numberValue;
                  }
                }
              } catch (e) {}
            }
          }

          if (orderId) {
            return orderId;
          }

          return null;
        } catch (error) {
          continue;
        }
      }
    }

    return null;
  }

  async placeOrder(params: PlaceOrderParams) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();

      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        config.signer
      );

      const gasLimit = await brokerContract.placeOrder.estimateGas({
        user: params.address,
        poolId: params.poolId,
        positionId: params.positionId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: params.operation,
        direction: params.direction,
        collateralAmount: params.collateralAmount,
        size: params.size,
        orderPrice: params.orderPrice,
        triggerPrice: params.triggerPrice,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly,
        slippagePct: params.slippagePct,
        executionFeeToken: params.executionFeeToken,
        leverage: params.leverage,
        tpSize: params.tpSize,
        tpPrice: params.tpPrice,
        slSize: params.slSize,
        slPrice: params.slPrice,
      });
      console.log("gasLimit--->", gasLimit);

      const transaction = await brokerContract.placeOrder(
        {
          user: params.address,
          poolId: params.poolId,
          positionId: params.positionId,
          orderType: params.orderType,
          triggerType: params.triggerType,
          operation: params.operation,
          direction: params.direction,
          collateralAmount: params.collateralAmount,
          size: params.size,
          orderPrice: params.orderPrice,
          triggerPrice: params.triggerPrice,
          timeInForce: TIME_IN_FORCE,
          postOnly: params.postOnly,
          slippagePct: params.slippagePct,
          executionFeeToken: params.executionFeeToken,
          leverage: params.leverage,
          tpSize: params.tpSize,
          tpPrice: params.tpPrice,
          slSize: params.slSize,
          slPrice: params.slPrice,
        },
        {
          gasLimit: (gasLimit * 120n) / 100n,
        }
      );

      console.log("Transaction sent:", transaction.hash);
      console.log("Waiting for confirmation...");

      const receipt = await transaction.wait();
      console.log("Transaction confirmed in block:", receipt?.blockNumber);

      console.log("placeOrder receipt--->", receipt);
      // 使用新的方法解析 orderId
      const orderId = this.getOrderIdFromTransaction(receipt);

      const result = {
        success: true,
        orderId,
        transactionHash: transaction.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? "success" : "failed",
        confirmations: 1,
        timestamp: Date.now(),
        receipt,
      };

      if (!orderId) {
        console.warn("Warning: OrderId not found in transaction logs");
        result.success = false;
      }

      return {
        code: 0,
        message: "placed order success",
        data: result,
      };
    } catch (error) {
      console.error("Error placing order:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
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
      console.error("Error getting allowance:", error);
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
      console.error("Error checking approval needs:", error);
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
      console.error("Approval error:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async cancelOrder(orderId: string) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();
      const brokerContract = await getBrokerSingerContract(
        config.chainId,
        config.signer
      );
      const tx = await brokerContract.cancelOrder(orderId);
      await tx.wait();
      return {
        code: 0,
        message: "Approval success",
      };
    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async cancelOrders(orderIds: string[]) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();
      const brokerContract = await getBrokerSingerContract(
        config.chainId,
        config.signer
      );
      const tx = await brokerContract.cancelOrders(orderIds);
      await tx.wait();
      return {
        code: 0,
        message: "Orders canceled success",
      };
    } catch (error) {
      console.error("Error canceling orders:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }
}
