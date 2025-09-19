import { PlaceOrderParams } from "@/types/type";
import { MyxBase } from "../base";
import { getBrokerSingerContract } from "@/web3/providers";
import { MyxClientConfig } from "../config";
import { TIME_IN_FORCE } from "@/config/con";
import { ethers } from "ethers";
import { getContractAddressByChainId } from "@/config/address/index";
import Emiter_ABI from "@/abi/Emiter.json";

export class MyxTrading extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  private getOrderIdFromTransaction(receipt: any): string | null {
    if (!receipt || !receipt.logs) {
      return null;
    }

    // 创建 Emiter 合约的接口来解析事件
    const emiterInterface = new ethers.Interface(Emiter_ABI);

    // 查找 OrderPlaced 事件定义
    const orderPlacedEvent = Emiter_ABI.find((item: any) =>
      item.type === 'event' && item.name === 'OrderPlaced'
    );

    if (!orderPlacedEvent) {
      console.error('OrderPlaced event not found in Emiter ABI');
      return null;
    }

    // 计算 OrderPlaced 事件的 topic hash
    const eventTopic = ethers.id('OrderPlaced(address,address,bytes32,uint256,uint256,uint8,uint8,uint8,uint8,uint256,uint256,uint256,uint8,bool,uint16,address,uint256,uint16)');

    console.log('Looking for OrderPlaced events with topic:', eventTopic);

    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];

      console.log(`Log ${i}:`, {
        address: log.address,
        topics: log.topics,
        data: log.data
      });

      // 检查是否是 OrderPlaced 事件
      if (log.topics && log.topics.length > 0 && log.topics[0] === eventTopic) {
        console.log(`Found OrderPlaced event in log ${i}`);

        try {
          // 使用 ethers 解析事件数据
          const parsedLog = emiterInterface.parseLog({
            topics: log.topics,
            data: log.data
          });

          if (parsedLog && parsedLog.name === 'OrderPlaced') {
            console.log('Parsed OrderPlaced event:', parsedLog.args);

            // 根据 Emiter.json 的定义，orderId 是第5个参数（索引4）
            // 事件字段顺序：broker, user, poolId, positionId, orderId, ...
            const orderId = parsedLog.args[4]; // orderId 在索引 4

            if (orderId !== undefined && orderId !== null) {
              const orderIdString = orderId.toString();
              console.log(`Found orderId: ${orderIdString}`);
              return orderIdString;
            }
          }
        } catch (error) {
          console.error(`Error parsing log ${i}:`, error);
          continue;
        }
      }
    }

    console.warn('OrderPlaced event not found in transaction logs');
    return null;
  }

  async placeOrder(params: PlaceOrderParams) {
    try {
      const config: MyxClientConfig = this.getConfig() as MyxClientConfig;

      const brokerContract = await getBrokerSingerContract(params.chainId, config.signer);

      const gasLimit = await brokerContract.placeOrder.estimateGas(
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
        }
      );
      console.log('gasLimit--->', gasLimit);

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
          gasLimit: gasLimit * 120n / 100n
        }
      );

      console.log('Transaction sent:', transaction.hash);
      console.log('Waiting for confirmation...');

      const receipt = await transaction.wait();
      console.log('Transaction confirmed in block:', receipt?.blockNumber);

      console.log('placeOrder receipt--->', receipt);
      // 使用新的方法解析 orderId
      const orderId = this.getOrderIdFromTransaction(receipt);

      const result = {
        success: true,
        orderId,
        transactionHash: transaction.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? 'success' : 'failed',
        confirmations: 1,
        timestamp: Date.now(),
        receipt
      };

      if (!orderId) {
        console.warn('Warning: OrderId not found in transaction logs');
        result.success = false;
      }

      return {
        code: 0,
        message: 'placed order success',
        data: result,
      };
    } catch (error) {
      console.error('Error placing order:', error);
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
        "function allowance(address owner, address spender) external view returns (uint256)"
      ];

      const config: MyxClientConfig = this.getConfig() as MyxClientConfig;

      const owner = await config.signer.getAddress();

      const spenderAddress = getContractAddressByChainId(config.chainId).ORDER_MANAGER;

      const tokenContract = new ethers.Contract(quoteAddress, erc20Abi, config.signer);

      const allowance = await tokenContract.allowance(owner, spenderAddress);

      return {
        code: 0,
        data: allowance.toString(),
      };
    } catch (error) {
      console.error('Error getting allowance:', error);
      throw error;
    }
  }

  async needsApproval(quoteAddress: string, requiredAmount: string): Promise<boolean> {
    try {
      const currentAllowanceRes = await this.getApproveQuoteAmount(quoteAddress);
      const currentAllowance = currentAllowanceRes.data;
      const allowanceBigInt = ethers.getBigInt(currentAllowance);
      const requiredBigInt = ethers.getBigInt(requiredAmount);

      const needsApproval = allowanceBigInt < requiredBigInt;

      return needsApproval;
    } catch (error) {
      console.error('Error checking approval needs:', error);
      return true;
    }
  }

  async approveAuthorization({ quoteAddress, amount }: { quoteAddress: string, amount?: string }) {
    try {
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)"
      ];

      const config: MyxClientConfig = this.getConfig() as MyxClientConfig;
      const usdcContract = new ethers.Contract(quoteAddress, erc20Abi, config.signer);
      const approveAmount = amount ?? ethers.MaxUint256;
      const spenderAddress = getContractAddressByChainId(config.chainId).ORDER_MANAGER;
      const tx = await usdcContract.approve(spenderAddress, approveAmount);
      await tx.wait();
      return {
        code: 0,
        message: 'Approval success',
      };
    } catch (error) {
      console.error('Approval error:', error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async cancelOrder(orderId: string) {
    try {
      const config: MyxClientConfig = this.getConfig() as MyxClientConfig;
      const brokerContract = await getBrokerSingerContract(config.chainId, config.signer);
      const tx = await brokerContract.cancelOrder(orderId);
      await tx.wait();
      return {
        code: 0,
        message: 'Approval success',
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
      const config: MyxClientConfig = this.getConfig() as MyxClientConfig;
      const brokerContract = await getBrokerSingerContract(config.chainId, config.signer);
      const tx = await brokerContract.cancelOrders(orderIds);
      await tx.wait();
      return {
        code: 0,
        message: 'Orders canceled success',
      };
    } catch (error) {
      console.error('Error canceling orders:', error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }
}
