import { ConfigManager } from "../config/index.js";
import { Logger } from "@/logger";
import { GetHistoryOrdersParams } from "@/api";
import {
  getTradingRouterContract,
} from "@/web3/providers";
import { getPublicClient } from "@/web3/viemClients.js";
import { TIME_IN_FORCE } from "@/config/con";
import {
  PlaceOrderParams,
  OperationType,
  OrderType,
  PositionTpSlOrderParams,
} from "@/types/trading";
import { Utils } from "../utils/index.js";
import { UpdateOrderParams } from "@/types/order";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { maxUint256 } from "viem";
import { Account } from "../account/index.js";
import { ChainId } from "@/config/chain";
import { Api } from "../api/index.js";
import { TRADE_GAS_LIMIT_RATIO } from "@/config/fee";
import { getContractAddressByChainId } from "@/config/address/index.js";

export class Order {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private account: Account
  private api: Api;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils, account: Account, api: Api) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.account = account
    this.api = api;
  }

  async createIncreaseOrder(params: PlaceOrderParams) {
    try {
      // const networkFee = await this.utils.getNetworkFee(
      //   marketId,
      //   params.chainId
      // );

      // let totalNetWorkFee = BigInt(networkFee)

      // if (params.tpSize && BigInt(params.tpSize) > 0) {
      //   totalNetWorkFee += BigInt(networkFee)
      // }
      // if (params.slSize && BigInt(params.slSize) > 0) {
      //   totalNetWorkFee += BigInt(networkFee)
      // }

      // 1 no position + networkFee * 4 (open tp sl liquidate) 
      // 2 have position + networkFee * 3 (increase tp sl)
      // 3 partly decrease position (last margin is enough (2 * networkFee)? add 0 : add networkFee)

      const collateralAmount = BigInt(params.collateralAmount) //+ BigInt(tradingFee) + totalNetWorkFee
      const availableRes = await this.account.getAvailableMarginBalance({ poolId: params.poolId, chainId: params.chainId, address: params.address });
      const availableAccountMarginBalance = availableRes.code === 0 ? (availableRes.data ?? 0n) : 0n;
      let depositAmount = BigInt(0)
      const diff = collateralAmount - availableAccountMarginBalance

      if (diff > BigInt(0)) {
        depositAmount = diff
      }

      const depositData = {
        token: params.executionFeeToken,
        amount: depositAmount.toString()
      }

      const data = {
        user: params.address,
        poolId: params.poolId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.INCREASE,
        direction: params.direction,
        collateralAmount: collateralAmount.toString(),
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly ?? false,
        slippagePct: params.slippagePct ?? "0",
        leverage: params.leverage ?? 0,
        tpSize: params.tpSize ?? "0",
        tpPrice: params.tpPrice ?? "0",
        slSize: params.slSize ?? "0",
        slPrice: params.slPrice ?? "0",
        broker: this.configManager.getConfig().brokerAddress,
      }

      const needsApproval = await this.utils.needsApproval(
        params.address,
        params.chainId,
        params.executionFeeToken,
        params.collateralAmount,
        getContractAddressByChainId(params.chainId).TRADING_ROUTER,
      );

      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId: params.chainId,
          quoteAddress: params.executionFeeToken,
          amount: maxUint256.toString(),
          spenderAddress: getContractAddressByChainId(params.chainId).TRADING_ROUTER,
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const tradingRouterContract = await getTradingRouterContract(
        params.chainId,
      );

      let hash: `0x${string}`;

      if (!params.positionId) {
        const positionSalt = '1';
        this.logger.info("createIncreaseOrder salt position params--->", { positionSalt, data, depositData });

        const gasLimit = await tradingRouterContract.estimateGas!.placeOrderWithSalt([positionSalt, { ...depositData }, data]);

        hash = await tradingRouterContract.write!.placeOrderWithSalt(
          [positionSalt, { ...depositData }, data],
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      } else {
        this.logger.info("createIncreaseOrder nft position params--->", { ...data, positionId: params.positionId });

        const gasLimit = await tradingRouterContract.estimateGas!.placeOrderWithPosition([
          params.positionId.toString(),
          { ...depositData },
          data,
        ]);

        hash = await tradingRouterContract.write!.placeOrderWithPosition(
          [params.positionId.toString(), { ...depositData }, data],
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      }

      const receipt = await getPublicClient(params.chainId).waitForTransactionReceipt({ hash });

      const result = {
        success: true,
        transactionHash: hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === "success" ? "success" : "failed",
        confirmations: 1,
        timestamp: Date.now(),
        receipt,
      };

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

  async closeAllPositions(chainId: number, params: PlaceOrderParams[]) {
    try {
      const depositData = {
        token: '0x0000000000000000000000000000000000000000',
        amount: '0'
      };

      const positionIds = params.map((param: PlaceOrderParams) => param.positionId.toString());

      const dataMap = params.map((param: PlaceOrderParams) => {
        return {
          user: param.address,
          poolId: param.poolId,
          orderType: param.orderType,
          triggerType: param.triggerType,
          operation: OperationType.DECREASE,
          direction: param.direction,
          collateralAmount: param.collateralAmount,
          size: param.size,
          price: param.price,
          timeInForce: TIME_IN_FORCE,
          postOnly: param.postOnly,
          slippagePct: param.slippagePct,
          leverage: param.leverage,
          tpSize: 0,
          tpPrice: 0,
          slSize: 0,
          slPrice: 0,
          broker: this.configManager.getConfig().brokerAddress,
        }
      })

      this.logger.info("closeAllPositions params--->", depositData, positionIds, dataMap);

      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      const tradingRouterContract = await getTradingRouterContract(
        chainId,
      );

      const gasLimit = await tradingRouterContract.estimateGas!.placeOrdersWithPosition([depositData, positionIds, dataMap]);
      const hash = await tradingRouterContract.write!.placeOrdersWithPosition([depositData, positionIds, dataMap], {
        gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[chainId as ChainId]) / 100n,
      });

      const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });

      return {
        code: 0,
        message: "close all positions success",
        transactionHash: hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === "success" ? "success" : "failed",
        confirmations: 1,
        timestamp: Date.now(),
        receipt,
      };
    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async createDecreaseOrder(params: PlaceOrderParams) {
    try {
      const data = {
        user: params.address,
        poolId: params.poolId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.DECREASE,
        direction: params.direction,
        collateralAmount: params.collateralAmount,
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly,
        slippagePct: params.slippagePct,
        leverage: params.leverage,
        tpSize: 0,
        tpPrice: 0,
        slSize: 0,
        slPrice: 0,
        broker: this.configManager.getConfig().brokerAddress,
      }

      const collateralAmount = BigInt(params.collateralAmount) //+ BigInt(tradingFee) + totalNetWorkFee
      const availableRes = await this.account.getAvailableMarginBalance({ poolId: params.poolId, chainId: params.chainId, address: params.address });
      const availableAccountMarginBalance = availableRes.code === 0 ? (availableRes.data ?? 0n) : 0n;
      let depositAmount = BigInt(0)
      const diff = collateralAmount - availableAccountMarginBalance

      if (diff > BigInt(0)) {
        depositAmount = diff
      }

      const depositData = {
        token: params.executionFeeToken,
        amount: depositAmount.toString()
      }
      
      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      const tradingRouterContract = await getTradingRouterContract(
        params.chainId,
      );

      let hash: `0x${string}`;
      if (!params.positionId) {
        const positionId = 1
        this.logger.info("createDecreaseOrder salt position params--->", [positionId, depositData, { data }]);
        const gasLimit = await tradingRouterContract.estimateGas!.placeOrderWithSalt([positionId.toString(), depositData, data]);

        hash = await tradingRouterContract.write!.placeOrderWithSalt(
          [positionId.toString(), depositData, data],
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      } else {
        this.logger.info("createDecreaseOrder nft position params--->", [params.positionId, depositData, { data }]);
        const gasLimit = await tradingRouterContract.estimateGas!.placeOrderWithPosition([params.positionId.toString(), depositData, data]);

        hash = await tradingRouterContract.write!.placeOrderWithPosition(
          [params.positionId.toString(), depositData, data],
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      }

      const receipt = await getPublicClient(params.chainId).waitForTransactionReceipt({ hash });

      const result = {
        success: true,
        transactionHash: hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === "success" ? "success" : "failed",
        confirmations: 1,
        timestamp: Date.now(),
        receipt,
      };

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
      const tradingRouterContract = await getTradingRouterContract(
        params.chainId,
      );

      try {

        if (params.tpSize !== "0" && params.slSize !== "0") {
          const data = [
            {
              user: params.address,
              poolId: params.poolId,
              orderType: OrderType.STOP,
              triggerType: params.tpTriggerType,
              operation: OperationType.DECREASE,
              direction: params.direction,
              collateralAmount: '0',
              size: params.tpSize ?? "0",
              price: params.tpPrice ?? "0",
              timeInForce: TIME_IN_FORCE,
              postOnly: false,
              slippagePct: params.slippagePct ?? "0",
              leverage: params.leverage,
              tpSize: "0",
              tpPrice: "0",
              slSize: "0",
              slPrice: "0",
              broker: this.configManager.getConfig().brokerAddress,
            },
            {
              user: params.address,
              poolId: params.poolId,
              orderType: OrderType.STOP,
              triggerType: params.slTriggerType,
              operation: OperationType.DECREASE,
              direction: params.direction,
              collateralAmount: '0',
              size: params.slSize ?? "0",
              price: params.slPrice ?? "0",
              timeInForce: TIME_IN_FORCE,
              postOnly: false,
              slippagePct: params.slippagePct ?? "0",
              leverage: params.leverage,
              tpSize: "0",
              tpPrice: "0",
              slSize: "0",
              slPrice: "0",
              broker: this.configManager.getConfig().brokerAddress,
            },
          ];

          const depositData = {
            token: '0x0000000000000000000000000000000000000000',
            amount: '0'
          }

          let hash: `0x${string}`;

          if (!params.positionId) {
            this.logger.info("createPositionTpSlOrder salt position data--->", data);

            const positionId = 1
            const gasLimit = await tradingRouterContract.estimateGas!.placeOrdersWithSalt([depositData, [positionId.toString(), positionId.toString()], data]);

            hash = await tradingRouterContract.write!.placeOrdersWithSalt([depositData, [positionId.toString(), positionId.toString()], data], {
              gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
            });
          } else {
            const gasLimit = await tradingRouterContract.estimateGas!.placeOrdersWithPosition([depositData, [params.positionId.toString(), params.positionId.toString()], data]);

            hash = await tradingRouterContract.write!.placeOrdersWithPosition([depositData, [params.positionId.toString(), params.positionId.toString()], data], {
              gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
            });
          }

          const receipt = await getPublicClient(params.chainId).waitForTransactionReceipt({ hash });

          const result = {
            success: true,
            transactionHash: hash,
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
            status: receipt?.status === "success" ? "success" : "failed",
            confirmations: 1,
            timestamp: Date.now(),
            receipt,
          };

          // if (!orderId) {
          //   this.logger.warn("Warning: OrderId not found in transaction logs");
          //   result.success = false;
          // }

          return {
            code: 0,
            message: "create decrease order success",
            data: result,
          };
        }

        const data = {
          user: params.address,
          poolId: params.poolId,
          orderType: OrderType.STOP,
          triggerType:
            params.tpSize !== "0" ? params.tpTriggerType : params.slTriggerType,
          operation: OperationType.DECREASE,
          direction: params.direction,
          collateralAmount: '0',
          size:
            params.tpSize !== "0" ? params.tpSize ?? "0" : params.slSize ?? "0",
          price:
            params.tpPrice !== "0"
              ? params.tpPrice ?? "0"
              : params.slPrice ?? "0",
          timeInForce: TIME_IN_FORCE,
          postOnly: false,
          slippagePct: params.slippagePct ?? "0",
          leverage: 0,
          tpSize: "0",
          tpPrice: "0",
          slSize: "0",
          slPrice: "0",
          broker: this.configManager.getConfig().brokerAddress,
        };

        const depositData = {
          token: '0x0000000000000000000000000000000000000000',
          amount: '0'
        }

        let hash: `0x${string}`;
        if (!params.positionId) {
          this.logger.info("createPositionTpOrSlOrder salt position data--->", data);
          const positionId = 1;
          const gasLimit = await tradingRouterContract.estimateGas!.placeOrderWithSalt([positionId.toString(), depositData, data]);

          hash = await tradingRouterContract.write!.placeOrderWithSalt([positionId.toString(), depositData, data], {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          });
        } else {
          this.logger.info("createPositionTpOrSlOrder nft position data--->", data);
          const gasLimit = await tradingRouterContract.estimateGas!.placeOrderWithPosition([params.positionId.toString(), depositData, data]);
          hash = await tradingRouterContract.write!.placeOrderWithPosition([params.positionId.toString(), depositData, data], {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          });
        }

        const receipt = await getPublicClient(params.chainId).waitForTransactionReceipt({ hash });

        const result = {
          success: true,
          transactionHash: hash,
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed?.toString(),
          status: receipt?.status === "success" ? "success" : "failed",
          confirmations: 1,
          timestamp: Date.now(),
          receipt,
        };

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

  async cancelAllOrders(orderIds: string[], chainId: ChainId) {
    try {
      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const tradingRouterContract = await getTradingRouterContract(
        chainId,
      );

      const hash = await tradingRouterContract.write!.cancelOrders([orderIds]);
      await getPublicClient(chainId).waitForTransactionReceipt({ hash });
      return {
        code: 0,
        message: "cancel all orders success",
      };
    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async cancelOrder(orderId: string, chainId: ChainId) {
    try {
      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const tradingRouterContract = await getTradingRouterContract(
        chainId,
      );

      const hash = await tradingRouterContract.write!.cancelOrder([orderId]);
      await getPublicClient(chainId).waitForTransactionReceipt({ hash });
      return {
        code: 0,
        message: "cancel order success",
      };
    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async cancelOrders(orderIds: string[], chainId: ChainId) {
    try {
      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const tradingRouterContract = await getTradingRouterContract(
        chainId,
      );
      const hash = await tradingRouterContract.write!.cancelOrders([orderIds]);
      await getPublicClient(chainId).waitForTransactionReceipt({ hash });
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

  async updateOrderTpSl(params: UpdateOrderParams, quoteAddress: string, chainId: number, address: string, marketId: string, isTpSlOrder?: boolean) {

    const networkFee = await this.utils.getNetworkFee(marketId, chainId)

    const data = {
      orderId: params.orderId,
      size: params.size,
      price: params.price,
      broker: this.configManager.getConfig().brokerAddress,
      tpsl: {
        tpSize: isTpSlOrder ? params.tpSize : '0',
        tpPrice: isTpSlOrder ? params.tpPrice : '0',
        slSize: isTpSlOrder ? params.slSize : '0',
        slPrice: isTpSlOrder ? params.slPrice : '0',
      },
    };

    const depositData = {
      token: quoteAddress,
      amount: networkFee.toString()
    }

    if (!this.configManager.hasSigner()) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }

    const tradingRouterContract = await getTradingRouterContract(
      chainId,
    );

    this.logger.info("updateOrderTpSl params", data);

    try {
      const needsApproval = await this.utils.needsApproval(
        address,
        chainId,
        params.executionFeeToken,
        networkFee.toString(),
        getContractAddressByChainId(chainId).TRADING_ROUTER,
      );

      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId: chainId,
          quoteAddress: params.executionFeeToken,
          amount: maxUint256.toString(),
          spenderAddress: getContractAddressByChainId(chainId).TRADING_ROUTER,
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const gasLimit = await tradingRouterContract.estimateGas!.updateOrder([depositData, data]);

      const hash = await tradingRouterContract.write!.updateOrder([depositData, data], {
        gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[chainId as ChainId]) / 100n,
      });

      const receipt = await getPublicClient(chainId).waitForTransactionReceipt({ hash });
      this.logger.info("updateOrderTpSl receipt", receipt);
      return {
        code: 0,
        data: receipt,
        message: "update order success",
      };
    } catch (error) {
      this.logger.error("Error updating order:", error);
      return {
        code: -1,
        message: "Failed to update order",
      };
    }
  }

  async getOrders(address: string) {

    // Auto-fetch accessToken; refresh if missing or expired
    const accessToken = await this.configManager.getAccessToken();

    try {
      const res = await this.api.getOrders(accessToken ?? '', address);
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      this.logger.error("Error fetching orders:", error);
      return {
        code: -1,
        message: "Failed to fetch orders",
      };
    }
  }

  async getOrderHistory(params: GetHistoryOrdersParams, address: string) {
    const accessToken = await this.configManager.getAccessToken() ?? ''

    const res = await this.api.getHistoryOrders({ accessToken, ...params, address });
    return {
      code: 0,
      data: res.data,
    };
  }
}
