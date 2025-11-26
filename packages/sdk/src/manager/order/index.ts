import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";
import { getHistoryOrders, GetHistoryOrdersParams, getOrders } from "@/api";
import {
  getBrokerSingerContract,
} from "@/web3/providers";
import { TIME_IN_FORCE } from "@/config/con";
import {
  PlaceOrderParams,
  OperationType,
  OrderType,
  PositionTpSlOrderParams,
  Direction,
} from "@/types/trading";
import { Utils } from "../utils";
import { UpdateOrderParams } from "@/types/order";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { ethers, keccak256 } from "ethers";
import { Address, encodeAbiParameters, parseAbiParameters } from "viem";
import { Account } from "../account";
import { getContractAddressByChainId } from "@/config/address/index";
import { getContract } from "@/web3";
import accountAbi from "@/abi/Account.json";
export class Order {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private account: Account;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils, account: Account) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.account = account;
  }

  async createPositionId(poolId: string, user: Address, direction: Direction, salt: bigint) {
    const encoded = encodeAbiParameters(parseAbiParameters('bytes32 poolId, address user, uint8 direction, uint64 salt'), [
      poolId as `0x${string}`,
      user,
      direction,
      salt,
    ]);

    return keccak256(encoded);
  }

  async createIncreaseOrder(params: PlaceOrderParams) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();
      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      const brokerContract = await getBrokerSingerContract(
        params.chainId,
      );
      const networkFee = await this.utils.getNetworkFee(
        params.executionFeeToken
      );

      const collateralWithNetworkFee =
        BigInt(params.collateralAmount) + BigInt(networkFee);

      const needsApproval = await this.utils.needsApproval(
        params.executionFeeToken,
        collateralWithNetworkFee.toString(),
      );


      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          quoteAddress: params.executionFeeToken,
          amount: ethers.MaxUint256.toString(),
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const marginAccountBalanceRes = await this.account.getTradableAmount({ poolId: params.poolId });
      const walletBalanceRes = await this.account.getWalletQuoteTokenBalance();
      console.log("marginAccountBalance--->", marginAccountBalanceRes);
      console.log("createIncreaseOrder walletBalance--->", walletBalanceRes);
      const marginAccountBalance = marginAccountBalanceRes?.data;
      const walletBalance = walletBalanceRes?.data;

      if (marginAccountBalanceRes.code !== 0 || walletBalanceRes.code !== 0) {
        return {
          code: -1,
          message: "Failed to get tradable amount or wallet balance",
        };
      }

      let useAccountBalance = false
      const totalBalance = BigInt(marginAccountBalance?.freeAmount.toString() ?? 0) + BigInt(marginAccountBalance?.tradeableProfit.toString() ?? 0)
      let transferAmount = 0n



      if (totalBalance > 0) {
        useAccountBalance = true
        transferAmount = collateralWithNetworkFee - totalBalance
      }

      console.log('transferAmount-->', transferAmount)

      const data = {
        user: params.address,
        poolId: params.poolId,
        orderType: params.orderType,
        triggerType: params.triggerType,
        operation: OperationType.INCREASE,
        direction: params.direction,
        collateralAmount: collateralWithNetworkFee.toString(),
        size: params.size,
        price: params.price,
        timeInForce: TIME_IN_FORCE,
        postOnly: params.postOnly ?? false,
        slippagePct: params.slippagePct ?? "0",
        executionFeeToken: params.executionFeeToken,
        leverage: params.leverage ?? 0,
        tpSize: params.tpSize ?? "0",
        tpPrice: params.tpPrice ?? "0",
        slSize: params.slSize ?? "0",
        slPrice: params.slPrice ?? "0",
        useAccountBalance,
      }

      const contractAddresses = getContractAddressByChainId(params.chainId);
      const accountAddress = contractAddresses.Account;

      // 如果需要转账，先执行 deposit 交易
      if (transferAmount > 0) {
        // 检查是否需要授权
        const needApproval = await this.utils.needsApproval(
          params.executionFeeToken,
          transferAmount.toString(),
          accountAddress,
        );

        if (needApproval) {
          const approvalResult = await this.utils.approveAuthorization({
            quoteAddress: params.executionFeeToken,
            amount: ethers.MaxUint256.toString(),
            spenderAddress: accountAddress,
          });

          if (approvalResult.code !== 0) {
            throw new Error(approvalResult.message);
          }
        }

        // 执行 deposit 交易
        const accountContract = getContract(
          accountAddress,
          accountAbi,
          config.signer
        );
        console.log('transferAmount-->', transferAmount);

        const depositGasLimit = await accountContract.deposit.estimateGas(
          params.address,
          params.poolId,
          transferAmount
        );

        console.log("depositGasLimit--->", depositGasLimit);

        const depositTx = await accountContract.deposit(
          params.address,
          params.poolId,
          transferAmount,
          {
            gasLimit: (depositGasLimit * 120n) / 100n,
          }
        );

        this.logger.info("Deposit transaction sent:", depositTx.hash);

        // 等待 deposit 交易确认
        const depositReceipt = await depositTx.wait();
        this.logger.info("Deposit confirmed in block:", depositReceipt?.blockNumber);
      }

      // 执行 placeOrder 交易
      let transaction;
      if (!params.positionId) {
        const positionSalt = '1';
        this.logger.info("createIncreaseOrder salt position params--->", { ...data, positionSalt });

        const gasLimit = await brokerContract.placeOrderWithSalt.estimateGas(positionSalt, data);

        transaction = await brokerContract.placeOrderWithSalt(
          positionSalt,
          data,
          {
            gasLimit: (gasLimit * 120n) / 100n,
          }
        );
      } else {
        this.logger.info("createIncreaseOrder nft position params--->", { ...data, positionId: params.positionId });

        const gasLimit = await brokerContract.placeOrderWithPosition.estimateGas(
          params.positionId.toString(),
          data
        );

        transaction = await brokerContract.placeOrderWithPosition(
          params.positionId.toString(),
          data,
          {
            gasLimit: (gasLimit * 120n) / 100n,
          }
        );
      }

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
      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        params.chainId,
      );
      const networkFee = await this.utils.getNetworkFee(
        params.executionFeeToken
      );

      const collateralWithNetworkFee =
        BigInt(params.collateralAmount) + BigInt(networkFee);


      const data = {
        user: params.address,
        poolId: params.poolId,
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
        useAccountBalance: false,
      }

      let transaction;
      if (!params.positionId) {
        const positionId = 1
        this.logger.info("createDecreaseOrder salt position params--->", [positionId, { data }]);
        const gasLimit = await brokerContract.placeOrderWithSalt.estimateGas(positionId.toString(), data);

        transaction = await brokerContract.placeOrderWithSalt(positionId.toString(),
          data,
          {
            gasLimit: (gasLimit * 130n) / 100n,
          }
        );
      } else {
        this.logger.info("createDecreaseOrder nft position params--->", [params.positionId, { data }]);
        const gasLimit = await brokerContract.placeOrderWithPosition.estimateGas(params.positionId.toString(), data);

        transaction = await brokerContract.placeOrderWithPosition(params.positionId.toString(),
          data,
          {
            gasLimit: (gasLimit * 130n) / 100n,
          }
        );
      }

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
      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        params.chainId,
      );
      try {
        const networkFee = await this.utils.getNetworkFee(
          params.executionFeeToken
        );

        if (params.tpSize !== "0" && params.slSize !== "0") {
          const data = [
            {
              user: params.address,
              poolId: params.poolId,
              orderType: OrderType.STOP,
              triggerType: params.tpTriggerType,
              operation: OperationType.DECREASE,
              direction: params.direction,
              collateralAmount: networkFee,
              size: params.tpSize ?? "0",
              price: params.tpPrice ?? "0",
              timeInForce: TIME_IN_FORCE,
              postOnly: false,
              slippagePct: "0",
              executionFeeToken: params.executionFeeToken,
              leverage: 0,
              tpSize: "0",
              tpPrice: "0",
              slSize: "0",
              slPrice: "0",
              useAccountBalance: false,
            },
            {
              user: params.address,
              poolId: params.poolId,
              orderType: OrderType.STOP,
              triggerType: params.slTriggerType,
              operation: OperationType.DECREASE,
              direction: params.direction,
              collateralAmount: networkFee,
              size: params.slSize ?? "0",
              price: params.slPrice ?? "0",
              timeInForce: TIME_IN_FORCE,
              postOnly: false,
              slippagePct: "0",
              executionFeeToken: params.executionFeeToken,
              leverage: 0,
              tpSize: "0",
              tpPrice: "0",
              slSize: "0",
              slPrice: "0",
              useAccountBalance: false,
            },
          ];

          let transaction
          if (!params.positionId) {
            this.logger.info("createPositionTpSlOrder salt position data--->", data);

            const positionId = 1//await this.createPositionId(params.poolId, params.address as `0x${string}`, params.direction, BigInt(1));
            const gasLimit = await brokerContract.placeOrdersWithSalt.estimateGas([positionId.toString(), positionId.toString()], data);

            transaction = await brokerContract.placeOrdersWithSalt([positionId.toString(), positionId.toString()], data, {
              gasLimit: (gasLimit * 120n) / 100n,
            });
          } else {
            this.logger.info("createPositionTpSlOrder nft position data--->", data);
            const gasLimit = await brokerContract.placeOrdersWithPosition.estimateGas([params.positionId.toString(), params.positionId.toString()], data);

            transaction = await brokerContract.placeOrdersWithPosition([params.positionId.toString(), params.positionId.toString()], data, {
              gasLimit: (gasLimit * 120n) / 100n,
            });
          }

          this.logger.info("Transaction sent:", transaction.hash);
          this.logger.info("Waiting for confirmation...");

          const receipt = await transaction.wait();
          this.logger.info(
            "Transaction confirmed in block:",
            receipt?.blockNumber
          );

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
          orderType: OrderType.STOP,
          triggerType:
            params.tpSize !== "0" ? params.tpTriggerType : params.slTriggerType,
          operation: OperationType.DECREASE,
          direction: params.direction,
          collateralAmount: networkFee,
          size:
            params.tpSize !== "0" ? params.tpSize ?? "0" : params.slSize ?? "0",
          price:
            params.tpPrice !== "0"
              ? params.tpPrice ?? "0"
              : params.slPrice ?? "0",
          timeInForce: TIME_IN_FORCE,
          postOnly: false,
          slippagePct: "0",
          executionFeeToken: params.executionFeeToken,
          leverage: 0,
          tpSize: "0",
          tpPrice: "0",
          slSize: "0",
          slPrice: "0",
          useAccountBalance: false,
        };

        let transaction;
        if (!params.positionId) {
          this.logger.info("createPositionTpOrSlOrder salt position data--->", data);
          const positionId = 1//await this.createPositionId(params.poolId, params.address as `0x${string}`, params.direction, BigInt(1));
          const gasLimit = await brokerContract.placeOrderWithSalt.estimateGas(positionId.toString(), data);

          transaction = await brokerContract.placeOrderWithSalt(positionId.toString(), data, {
            gasLimit: (gasLimit * 120n) / 100n,
          });
        } else {
          this.logger.info("createPositionTpOrSlOrder nft position data--->", data);
          const gasLimit = await brokerContract.placeOrderWithPosition.estimateGas(params.positionId.toString(), data);
          transaction = await brokerContract.placeOrderWithPosition(params.positionId.toString(), data, {
            gasLimit: (gasLimit * 120n) / 100n,
          });
        }

        this.logger.info("Transaction sent:", transaction.hash);
        this.logger.info("Waiting for confirmation...");

        const receipt = await transaction.wait();
        this.logger.info(
          "Transaction confirmed in block:",
          receipt?.blockNumber
        );

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
      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        config.chainId
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
      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        config.chainId
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
    if (!config.signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }

    const brokerContract = await getBrokerSingerContract(
      config.chainId
    );

    const data = {
      orderId: params.orderId,
      size: params.size,
      price: params.price,
      tpsl: {
        tpSize: params.tpSize,
        tpPrice: params.tpPrice,
        slSize: params.slSize,
        slPrice: params.slPrice,
        executionFeeToken: params.executionFeeToken,
        useOrderCollateral: true,
        useAccountBalance: false,
        paymentType: 0,
      },
    };

    this.logger.info("updateOrderTpSl params", data);

    try {
      const gasLimit = await brokerContract.updateOrder.estimateGas(data);

      const request = await brokerContract.updateOrder(data, {
        gasLimit: (gasLimit * 120n) / 100n,
      });

      const receipt = await request?.wait();
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
      console.error("Error fetching orders:", error);
      return {
        code: -1,
        message: "Failed to fetch orders",
      };
    }
  }

  async getOrderHistory(params: GetHistoryOrdersParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    const res = await getHistoryOrders({ accessToken, ...params });
    return {
      code: 0,
      data: res.data,
    };
  }
}
