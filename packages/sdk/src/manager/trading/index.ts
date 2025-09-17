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
    
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = brokerContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });

          if (parsedLog && parsedLog.name === 'OrderPlaced') {
            orderId = parsedLog.args.orderId || parsedLog.args[0];
            console.log('Order ID found:', orderId);
            break;
          }
        } catch (error) {
          continue;
        }
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
