import { PlaceOrderParams } from "@/trade/type";
import { MyxBase } from "../base";
import { getBrokerSingerContract } from "@/web3/providers";
import { MyxClientConfig } from "../config";
import { TIME_IN_FORCE } from "@/config/con";


export class MyxTrading extends MyxBase {
  constructor() {
    super();
    this.getConfig();
  }

  /**
   * 从交易回执中解析 orderId
   * @param receipt 交易回执
   * @returns orderId 字符串，如果未找到则返回 null
   */
  private getOrderIdFromTransaction(receipt: any): string | null {
    const ORDER_PLACED_TOPIC = '0xf6b9bfc100eeb47bf64644320e71b858b32880d5028e935db0e717302fa5b564';
    
    if (!receipt || !receipt.logs) {
      console.warn('No receipt or logs provided');
      return null;
    }

    console.log('Searching for OrderPlaced event with topic:', ORDER_PLACED_TOPIC);
    console.log('Total logs to examine:', receipt.logs.length);

    for (let i = 0; i < receipt.logs.length; i++) {
      const log = receipt.logs[i];
      
      // 检查是否有匹配的 topic
      if (log.topics && log.topics.length > 0 && log.topics[0] === ORDER_PLACED_TOPIC) {
        console.log(`Found matching topic in log ${i}:`, log);
        
        try {
          // 尝试从 topics[1] 解析 orderId (通常 indexed 参数在 topics 中)
          if (log.topics.length > 1) {
            const orderIdHex = log.topics[1];
            const orderId = parseInt(orderIdHex, 16).toString();
            console.log('Extracted orderId from topics[1]:', orderId);
            return orderId;
          }
          
          // 如果 topics 中没有，尝试从 data 中解析
          if (log.data && log.data !== '0x') {
            // data 通常是 ABI 编码的非 indexed 参数
            // 假设 orderId 是第一个参数 (32 bytes)
            const dataWithoutPrefix = log.data.slice(2); // 移除 '0x'
            if (dataWithoutPrefix.length >= 64) {
              const orderIdHex = '0x' + dataWithoutPrefix.slice(0, 64);
              const orderId = parseInt(orderIdHex, 16).toString();
              console.log('Extracted orderId from data:', orderId);
              return orderId;
            }
          }
        } catch (error) {
          console.error(`Error parsing orderId from log ${i}:`, error);
          continue;
        }
      }
    }

    console.warn('No OrderPlaced event found with the specified topic');
    return null;
  }

  async placeOrder(params: PlaceOrderParams) {
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

    return result;
  }

  cancelOrder(orderId: string) {
    return Promise.resolve({
      orderId,
      status: 'cancelled'
    });
  }

  getOrderHistory() {
    return Promise.resolve([]);
  }
}
