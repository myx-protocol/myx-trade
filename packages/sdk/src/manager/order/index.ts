import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { getOrders } from "@/api";
import { getBrokerSingerContract, getOrderManagerSingerContract } from "@/web3/providers";
import { Direction, TIME_IN_FORCE } from "@/config/con";
import { PlaceOrderParams, OperationType, OrderType, PositionTpSlOrderParams } from "@/types/trading";
import { Utils } from "../utils";
import { UpdateOrderParams } from "@/types/order";

export class Order {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
  }

  async createIncreaseOrder(params: PlaceOrderParams) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();

      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        config.signer
      );
      const networkFee = await this.utils.getNetworkFee(params.executionFeeToken);

      const collateralWithNetworkFee = BigInt(params.collateralAmount) + BigInt(networkFee);

      console.log('createIncreaseOrder params--->', {
        user: params.address,
        poolId: params.poolId,
        positionId: params.positionId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.INCREASE,
        direction: params.direction,
        collateralAmount: collateralWithNetworkFee,
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly,
        slippagePct: params.slippagePct,
        executionFeeToken: params.executionFeeToken,
        leverage: params.leverage,
        tpSize: params.tpSize ? params.tpSize : 0,
        tpPrice: params.tpPrice ? params.tpPrice : 0,
        slSize: params.slSize ? params.slSize : 0,
        slPrice: params.slPrice ? params.slPrice : 0,
      });
      const gasLimit = await brokerContract.placeOrder.estimateGas({
        user: params.address,
        poolId: params.poolId,
        positionId: params.positionId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.INCREASE,
        direction: params.direction,
        collateralAmount: collateralWithNetworkFee,
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly,
        slippagePct: params.slippagePct,
        executionFeeToken: params.executionFeeToken,
        leverage: params.leverage,
        tpSize: params.tpSize ? params.tpSize : 0,
        tpPrice: params.tpPrice ? params.tpPrice : 0,
        slSize: params.slSize ? params.slSize : 0,
        slPrice: params.slPrice ? params.slPrice : 0,
        useAccountBalance: false
      });


      const transaction = await brokerContract.placeOrder(
        {
          user: params.address,
          poolId: params.poolId,
          positionId: params.positionId ?? 0,
          orderType: params.orderType,
          triggerType: params.triggerType,
          operation: OperationType.INCREASE,
          direction: params.direction,
          collateralAmount: collateralWithNetworkFee,
          size: params.size,
          price: params.price,
          timeInForce: TIME_IN_FORCE,
          postOnly: params.postOnly,
          slippagePct: params.slippagePct,
          executionFeeToken: params.executionFeeToken,
          leverage: params.leverage,
          tpSize: params.tpSize ? params.tpSize : 0,
          tpPrice: params.tpPrice ? params.tpPrice : 0,
          slSize: params.slSize ? params.slSize : 0,
          slPrice: params.slPrice ? params.slPrice : 0,
          useAccountBalance: false
        },
        {
          gasLimit: (gasLimit * 120n) / 100n,
        }
      );

      this.logger.info("Transaction sent:", transaction.hash);
      this.logger.info("Waiting for confirmation...");

      const receipt = await transaction.wait();
      this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

      this.logger.info("createIncreaseOrder receipt--->", receipt);
      const orderId = this.utils.getOrderIdFromTransaction(receipt);

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
        this.logger.warn("Warning: OrderId not found in transaction logs");
        result.success = false;
      }

      return {
        code: 0,
        message: "create increase order success",
        data: result,
      };
    } catch (error) {
      this.logger.error("Error placing order:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async createDecreaseOrder(params: PlaceOrderParams) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();
      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        config.signer
      );
      const networkFee = await this.utils.getNetworkFee(params.executionFeeToken);

      const collateralWithNetworkFee = BigInt(params.collateralAmount) + BigInt(networkFee);

      console.log('createDecreaseOrder', params)


      console.log('createDecreaseOrder params--->', {
        user: params.address,
        poolId: params.poolId,
        positionId: params.positionId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.DECREASE,
        direction: params.direction,
        collateralAmount: collateralWithNetworkFee,
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly,
        slippagePct: params.slippagePct,
        executionFeeToken: params.executionFeeToken,
        leverage: params.leverage,
      });

      const gasLimit = await brokerContract.placeOrder.estimateGas({
        user: params.address,
        poolId: params.poolId,
        positionId: params.positionId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.DECREASE,
        direction: params.direction,
        collateralAmount: collateralWithNetworkFee,
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly,
        slippagePct: params.slippagePct,
        executionFeeToken: params.executionFeeToken,
        leverage: params.leverage,
        tpSize: 0,
        tpPrice: 0,
        slSize: 0,
        slPrice: 0,
        useAccountBalance: false
      });

      const transaction = await brokerContract.placeOrder(
        {
          user: params.address,
          poolId: params.poolId,
          positionId: params.positionId,
          orderType: params.orderType,
          triggerType: params.triggerType,
          operation: OperationType.DECREASE,
          direction: params.direction,
          collateralAmount: collateralWithNetworkFee,
          size: params.size,
          price: params.price,
          timeInForce: TIME_IN_FORCE,
          postOnly: false,
          slippagePct: params.slippagePct,
          executionFeeToken: params.executionFeeToken,
          leverage: params.leverage,
          tpSize: 0,
          tpPrice: 0,
          slSize: 0,
          slPrice: 0,
          useAccountBalance: false
        },
        {
          gasLimit: (gasLimit * 130n) / 100n,
        }
      );
      this.logger.info("Transaction sent:", transaction.hash);
      this.logger.info("Waiting for confirmation...");

      const receipt = await transaction.wait();
      this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

      this.logger.info("createDecreaseOrder receipt--->", receipt);
      const orderId = this.utils.getOrderIdFromTransaction(receipt);

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
        this.logger.warn("Warning: OrderId not found in transaction logs");
        result.success = false;
      }

      return {
        code: 0,
        message: "create decrease order success",
        data: result,
      };

    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async createPositionTpSlOrder(params: PositionTpSlOrderParams) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();
      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        config.signer
      );
      try {
        const networkFee = await this.utils.getNetworkFee(params.executionFeeToken);

        if (params.tpSize !== '0' && params.slSize !== '0') {
          const data = [
            {
              user: params.address,
              poolId: params.poolId,
              positionId: params.positionId,
              orderType: OrderType.STOP,
              triggerType: params.tpTriggerType,
              operation: OperationType.DECREASE,
              direction: params.direction,
              collateralAmount: networkFee,
              size: params.tpSize ?? '0',
              price: params.tpPrice ?? '0',
              timeInForce: TIME_IN_FORCE,
              postOnly: false,
              slippagePct: '0',
              executionFeeToken: params.executionFeeToken,
              leverage: 0,
              tpSize: '0',
              tpPrice: '0',
              slSize: '0',
              slPrice: '0',
              useAccountBalance: false
            },
            {
              user: params.address,
              poolId: params.poolId,
              positionId: params.positionId,
              orderType: OrderType.STOP,
              triggerType: params.slTriggerType,
              operation: OperationType.DECREASE,
              direction: params.direction,
              collateralAmount: networkFee,
              size: params.slSize ?? '0',
              price: params.slPrice ?? '0',
              timeInForce: TIME_IN_FORCE,
              postOnly: false,
              slippagePct: '0',
              executionFeeToken: params.executionFeeToken,
              leverage: 0,
              tpSize: '0',
              tpPrice: '0',
              slSize: '0',
              slPrice: '0',
              useAccountBalance: false
            },
          ]

          console.log('createPositionTpSlOrder data--->', data);

          const gasLimit = await brokerContract.placeOrders.estimateGas(data);

          const transaction = await brokerContract.placeOrders(
            data,
            {
              gasLimit: (gasLimit * 120n) / 100n,
            }
          );


          this.logger.info("Transaction sent:", transaction.hash);
          this.logger.info("Waiting for confirmation...");

          const receipt = await transaction.wait();
          this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

          this.logger.info("createDecreaseOrder receipt--->", receipt);
          const orderId = this.utils.getOrderIdFromTransaction(receipt);

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
            this.logger.warn("Warning: OrderId not found in transaction logs");
            result.success = false;
          }

          return {
            code: 0,
            message: "create decrease order success",
            data: result,
          };
        }

        const data = {
          user: params.address,
          poolId: params.poolId,
          positionId: params.positionId,
          orderType: OrderType.STOP,
          triggerType: params.tpSize !== '0' ? params.tpTriggerType : params.slTriggerType,
          operation: OperationType.DECREASE,
          direction: params.direction,
          collateralAmount: networkFee,
          size: params.tpSize !== '0' ? params.tpSize ?? '0' : params.slSize ?? '0',
          price: params.tpPrice !== '0' ? params.tpPrice ?? '0' : params.slPrice ?? '0',
          timeInForce: TIME_IN_FORCE,
          postOnly: false,
          slippagePct: '0',
          executionFeeToken: params.executionFeeToken,
          leverage: 0,
          tpSize: '0',
          tpPrice: '0',
          slSize: '0',
          slPrice: '0',
          useAccountBalance: false
        }

        console.log('createPositionTpSlOrder data--->', data);

        const gasLimit = await brokerContract.placeOrder.estimateGas(data);

        const transaction = await brokerContract.placeOrder(
          data,
          {
            gasLimit: (gasLimit * 120n) / 100n,
          }
        );
        this.logger.info("Transaction sent:", transaction.hash);
        this.logger.info("Waiting for confirmation...");

        const receipt = await transaction.wait();
        this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

        this.logger.info("createDecreaseOrder receipt--->", receipt);
        const orderId = this.utils.getOrderIdFromTransaction(receipt);

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
          this.logger.warn("Warning: OrderId not found in transaction logs");
          result.success = false;
        }

        return {
          code: 0,
          message: "create decrease order success",
          data: result,
        };
      } catch (error) {
        return {
          code: -1,
          // @ts-ignore
          message: error?.message,
        };
      }
    } catch (error) {
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
      this.logger.error("Error canceling orders:", error);
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async updateOrderTpSl(params: UpdateOrderParams) {
    const config: MyxClientConfig = this.configManager.getConfig();
    console.log("updateOrderTpSl params", params)

    // const orderManagerContract = await getOrderManagerSingerContract(
    //   config.chainId,
    //   config.signer
    // );

    // try {
    //   const gasLimit = await orderManagerContract.updateOrder.estimateGas({
    //     orderId: params.orderId,
    //     tpSize: params.tpSize,
    //     tpPrice: params.tpPrice,
    //     slSize: params.slSize,
    //     slPrice: params.slPrice,
    //     executionFeeToken: params.executionFeeToken,
    //     useOrderCollateral: false,
    //   });

    //   console.log('gaslimit->', gasLimit)

    //   const request = await orderManagerContract.updateOrder({
    //     orderId: params.orderId,
    //     tpSize: params.tpSize,
    //     tpPrice: params.tpPrice,
    //     slSize: params.slSize,
    //     slPrice: params.slPrice,
    //     executionFeeToken: params.executionFeeToken,
    //     useOrderCollateral: false,
    //   }, {
    //     gasLimit: (gasLimit * 120n) / 100n,
    //   }
    //   );

    // const receipt = await request?.wait()
    // console.log("updateOrderTpSl receipt", receipt)
    // return receipt;

    // } catch (e: any) {
    //   console.log("e", e)
    //   const revertData =
    //     e.data ||
    //     e.error?.data ||
    //     e.info?.error?.data ||
    //     e.cause?.data ||
    //     null;
    //   const error = orderManagerContract.interface.parseError(revertData)
    //   console.log("error", error)
    //   return {
    //     code: -1,
    //     message: "Failed to update order",
    //   };
    // }

    const brokerContract = await getBrokerSingerContract(
      config.chainId,
      config.signer
    );


    const data = {
      orderId: params.orderId,
      size: "10000000000000000",
      price: "110568447641688930000000000000000000",
      tpsl: {
        tpSize: params.tpSize,
        tpPrice: params.tpPrice,
        slSize: params.slSize,
        slPrice: params.slPrice,
        executionFeeToken: params.executionFeeToken,
        useOrderCollateral: true,
        useAccountBalance: false
      }
    }

    console.log(data)
    try {
      const gasLimit = await brokerContract.updateOrder.estimateGas(data);
      console.log('gaslimit->', gasLimit)

      const request = await brokerContract.updateOrder(data, {
        gasLimit: (gasLimit * 120n) / 100n,
      });

      const receipt = await request?.wait()
      console.log("updateOrderTpSl receipt", receipt)
      return receipt;
    } catch (error) {
      console.error('Error updating order:', error);
      return {
        code: -1,
        message: "Failed to update order",
      };
    }
  }

  async getOrders() {
    const config: MyxClientConfig = this.configManager.getConfig();

    // 自动获取 accessToken，如果没有或过期会自动刷新
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      return {
        code: -1,
        message: "Failed to obtain accessToken",
      };
    }

    try {
      const res = await getOrders(accessToken, config.chainId);
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        code: -1,
        message: "Failed to fetch orders",
      };
    }
  }
}
