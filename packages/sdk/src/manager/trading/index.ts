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

    let orderId: string | null = null;
    
    console.log('Receipt logs count:', receipt?.logs?.length);
    // 0xf6b9bfc100eeb47bf64644320e71b858b32880d5028e935db0e717302fa5b564
    
    if (receipt && receipt.logs) {
      for (let i = 0; i < receipt.logs.length; i++) {
        const log = receipt.logs[i];
        console.log(`Log ${i}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data
        });
        
        try {
          const parsedLog = brokerContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });

          console.log(`Parsed log ${i}:`, parsedLog);

          if (parsedLog && parsedLog.name === 'OrderPlaced') {
            orderId = parsedLog.args.orderId || parsedLog.args[0];
            console.log('Order ID found:', orderId);
            console.log('All args:', parsedLog.args);
            break;
          }
        } catch (error) {
          console.log(`Failed to parse log ${i}:`, error);
          continue;
        }
      }
    }
    
    if (!orderId) {
      console.warn('No OrderPlaced event found in transaction logs');
      
      // 备用方案：尝试通过不同的方式获取 orderId
      try {
        // 检查是否有任何包含数字ID的事件
        for (const log of receipt?.logs || []) {
          if (log.topics && log.topics.length > 0) {
            // 尝试解析为数字（orderId 通常是数字）
            for (let j = 1; j < log.topics.length; j++) {
              try {
                const potentialOrderId = parseInt(log.topics[j], 16);
                if (potentialOrderId > 0 && potentialOrderId < Number.MAX_SAFE_INTEGER) {
                  console.log('Potential orderId from topics:', potentialOrderId);
                  orderId = potentialOrderId.toString();
                  break;
                }
              } catch (e) {
                continue;
              }
            }
            if (orderId) break;
          }
        }
      } catch (error) {
        console.log('Backup orderId extraction failed:', error);
      }
    }

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
