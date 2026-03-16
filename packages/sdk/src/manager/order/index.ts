import { ConfigManager, MyxClientConfig } from "../config/index.js";
import { Logger } from "@/logger";
import { GetHistoryOrdersParams } from "@/api";
import {
  getBrokerSingerContract,
  getForwarderContract,
  getSeamlessBrokerContract,
} from "@/web3/providers";
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
import { ethers, Signer } from "ethers";
import { Seamless } from "../seamless/index.js";
import dayjs from "dayjs";
import { Account } from "../account/index.js";
import { ChainId } from "@/config/chain";
import { Api } from "../api/index.js";
import { TRADE_GAS_LIMIT_RATIO } from "@/config/fee";
import { getContractAddressByChainId } from "@/config/address/index.js";

export class Order {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private seamless: Seamless;
  private account: Account
  private api: Api;
  constructor(configManager: ConfigManager, logger: Logger, utils: Utils, seamless: Seamless, account: Account, api: Api) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.seamless = seamless;
    this.account = account
    this.api = api;
  }

  async createIncreaseOrder(params: PlaceOrderParams, tradingFee: string, marketId: string, positionAvailableMargin?: string) {
    try {
      const config: MyxClientConfig = this.configManager.getConfig();

      const networkFee = await this.utils.getNetworkFee(
        marketId,
        params.chainId
      );

      let totalNetWorkFee = BigInt(networkFee)

      if (params.tpSize && BigInt(params.tpSize) > 0) {
        totalNetWorkFee += BigInt(networkFee)
      }
      if (params.slSize && BigInt(params.slSize) > 0) {
        totalNetWorkFee += BigInt(networkFee)
      }

      const totalCollateralAmount = BigInt(params.collateralAmount) + BigInt(tradingFee)
      const availableAccountMarginBalance = await this.account.getAvailableMarginBalance({ poolId: params.poolId, chainId: params.chainId, address: params.address });
      const needAmount = totalCollateralAmount + totalNetWorkFee
      let depositAmount = BigInt(0)
      const diff = needAmount - (availableAccountMarginBalance - BigInt(positionAvailableMargin ?? 0))

      this.logger.info("createIncreaseOrder diff --->", { diff, needAmount, availableAccountMarginBalance, positionAvailableMargin })

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
        collateralAmount: totalCollateralAmount.toString(),
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
      }

      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet

      if (config.seamlessMode && authorized && seamlessWallet) {

        const isEnoughGas = await this.utils.checkSeamlessGas(params.address, params.chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }

        const forwarderContract = await getForwarderContract(params.chainId)
        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        let functionHash = ''

        if (!params.positionId) {
          this.logger.info("createIncreaseOrder placeOrderWithSalt data --->", [
            '1',
            { ...depositData },
            data
          ])
          functionHash = brokerContract.interface.encodeFunctionData('placeOrderWithSalt', [
            '1',
            { ...depositData },
            data
          ])
        } else {
          functionHash = brokerContract.interface.encodeFunctionData('placeOrderWithPosition', [
            params.positionId.toString(),
            { ...depositData },
            data
          ])
        }
        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: this.configManager.getConfig().brokerAddress,
          value: '0',
          gas: '800000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("createIncreaseOrder forward tx params --->", forwardTxParams)

        const rs = await this.seamless.forwarderTx(forwardTxParams, params.chainId, seamlessWallet as Signer);

        return {
          code: 0,
          message: "create increase order success",
          data: rs,
        };
      }

      const needsApproval = await this.utils.needsApproval(
        params.address,
        params.chainId,
        params.executionFeeToken,
        params.collateralAmount,
        getContractAddressByChainId(params.chainId).TRADING_ROUTER,
      );

      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId: params.chainId,
          quoteAddress: params.executionFeeToken,
          amount: ethers.MaxUint256.toString(),
          spenderAddress: getContractAddressByChainId(params.chainId).TRADING_ROUTER,
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        this.configManager.getConfig().brokerAddress
      );

      // Execute placeOrder transaction
      let transaction;
      if (!params.positionId) {
        const positionSalt = '1';
        this.logger.info("createIncreaseOrder salt position params--->", { positionSalt, data, depositData });

        const gasLimit = await brokerContract.placeOrderWithSalt.estimateGas(positionSalt, { ...depositData }, data);

        transaction = await brokerContract.placeOrderWithSalt(
          positionSalt,
          { ...depositData },
          data,
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      } else {
        this.logger.info("createIncreaseOrder nft position params--->", { ...data, positionId: params.positionId });

        const gasLimit = await brokerContract.placeOrderWithPosition.estimateGas(
          params.positionId.toString(),
          { ...depositData },
          data
        );

        transaction = await brokerContract.placeOrderWithPosition(
          params.positionId.toString(),
          { ...depositData },
          data,
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      }

      // this.logger.info("Transaction sent:", transaction.hash);
      // this.logger.info("Waiting for confirmation...");

      const receipt = await transaction.wait();
      // this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

      // this.logger.info("createIncreaseOrder receipt--->", receipt);
      // const orderId = this.utils.getOrderIdFromTransaction(receipt);

      const result = {
        success: true,
        // orderId,
        transactionHash: transaction.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? "success" : "failed",
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
      const config: MyxClientConfig = this.configManager.getConfig();

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
        }
      })

      this.logger.info("closeAllPositions params--->", depositData, positionIds, dataMap);

      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
      if (config.seamlessMode && authorized && seamlessWallet) {

        // if (needsApproval) {
        //   const approvalResult = await this.utils.approveAuthorization({
        //     chainId: chainId,
        //     quoteAddress: params[0].executionFeeToken,
        //     amount: ethers.MaxUint256.toString(),
        //     signer: seamlessWallet as Signer,
        //   });

        //   if (approvalResult.code !== 0) {
        //     throw new Error(approvalResult.message);
        //   }
        // }

        const isEnoughGas = await this.utils.checkSeamlessGas(params[0].address, chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }

        const forwarderContract = await getForwarderContract(chainId)

        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        const functionHash = brokerContract.interface.encodeFunctionData('placeOrdersWithPosition', [depositData, positionIds, dataMap])

        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: this.configManager.getConfig().brokerAddress,
          value: '0',
          gas: '800000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("cancel all positions forward tx params --->", forwardTxParams)

        const rs = await this.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

        return {
          code: 0,
          message: "cancel all positions success",
          data: rs,
        };
      }

      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      const brokerContract = await getBrokerSingerContract(
        chainId,
        this.configManager.getConfig().brokerAddress
      );

      // if (needsApproval) {
      //   const approvalResult = await this.utils.approveAuthorization({
      //     chainId: chainId,
      //     quoteAddress: params[0].executionFeeToken,
      //     amount: ethers.MaxUint256.toString(),
      //     spenderAddress: getContractAddressByChainId(chainId).TRADING_ROUTER,
      //   });

      //   if (approvalResult.code !== 0) {
      //     throw new Error(approvalResult.message);
      //   }
      // }


      const gasLimit = await brokerContract.placeOrdersWithPosition.estimateGas(depositData, positionIds, dataMap);
      const transaction = await brokerContract.placeOrdersWithPosition(depositData, positionIds, dataMap, {
        gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[chainId as ChainId]) / 100n,
      });

      // this.logger.info("Transaction sent:", transaction.hash);
      // this.logger.info("Waiting for confirmation...");

      const receipt = await transaction.wait();
      // this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

      // this.logger.info("closeAllPositions receipt--->", receipt);
      // const orderId = this.utils.getOrderIdFromTransaction(receipt);

      return {
        code: 0,
        message: "close all positions success",
        // data: orderId,
        transactionHash: transaction.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? "success" : "failed",
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
      const config: MyxClientConfig = this.configManager.getConfig();

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
      }

      const depositData = {
        token: '0x0000000000000000000000000000000000000000',
        amount: '0'
      }

      // const needsApproval = await this.utils.needsApproval(
      //   params.address,
      //   params.chainId,
      //   params.executionFeeToken,
      //   depositAmount.toString(),
      //   getContractAddressByChainId(params.chainId).TRADING_ROUTER,
      // );

      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(params.address, params.chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }

        const forwarderContract = await getForwarderContract(params.chainId)

        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        let functionHash = ''

        if (!params.positionId) {
          functionHash = brokerContract.interface.encodeFunctionData('placeOrderWithSalt', [
            '1',
            { ...depositData },
            data
          ])
        } else {
          functionHash = brokerContract.interface.encodeFunctionData('placeOrderWithPosition', [
            params.positionId.toString(),
            { ...depositData },
            data
          ])
        }

        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: this.configManager.getConfig().brokerAddress,
          value: '0',
          gas: '800000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("create decrease order forward tx params --->", forwardTxParams)

        const rs = await this.seamless.forwarderTx(forwardTxParams, params.chainId, seamlessWallet as Signer);

        return {
          code: 0,
          message: "create decrease order success",
          data: rs,
        };
      }

      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        this.configManager.getConfig().brokerAddress
      );

      // if (needsApproval) {
      //   const approvalResult = await this.utils.approveAuthorization({
      //     chainId: params.chainId,
      //     quoteAddress: params.executionFeeToken,
      //     amount: ethers.MaxUint256.toString(),
      //     spenderAddress: getContractAddressByChainId(params.chainId).TRADING_ROUTER,
      //   });

      //   if (approvalResult.code !== 0) {
      //     throw new Error(approvalResult.message);
      //   }
      // }


      let transaction;
      if (!params.positionId) {
        const positionId = 1
        this.logger.info("createDecreaseOrder salt position params--->", [positionId, depositData, { data }]);
        const gasLimit = await brokerContract.placeOrderWithSalt.estimateGas(positionId.toString(), depositData, data);

        transaction = await brokerContract.placeOrderWithSalt(positionId.toString(),
          depositData,
          data,
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      } else {
        this.logger.info("createDecreaseOrder nft position params--->", [params.positionId, depositData, { data }]);
        const gasLimit = await brokerContract.placeOrderWithPosition.estimateGas(params.positionId.toString(), depositData, data);

        transaction = await brokerContract.placeOrderWithPosition(params.positionId.toString(),
          depositData,
          data,
          {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          }
        );
      }

      // this.logger.info("Transaction sent:", transaction.hash);
      // this.logger.info("Waiting for confirmation...");

      const receipt = await transaction.wait();
      // this.logger.info("Transaction confirmed in block:", receipt?.blockNumber);

      // this.logger.info("createDecreaseOrder receipt--->", receipt);
      // const orderId = this.utils.getOrderIdFromTransaction(receipt);

      const result = {
        success: true,
        // orderId,
        transactionHash: transaction.hash,
        blockNumber: receipt?.blockNumber,
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status === 1 ? "success" : "failed",
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
      if (!config.signer && !config.seamlessMode) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        params.chainId,
        this.configManager.getConfig().brokerAddress
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
            },
          ];

          // const depositAmount = BigInt(networkFee) * BigInt(2)

          // const needsApproval = await this.utils.needsApproval(
          //   params.address,
          //   params.chainId,
          //   params.executionFeeToken,
          //   depositAmount.toString(),
          //   getContractAddressByChainId(params.chainId).TRADING_ROUTER,
          // );

          const depositData = {
            token: '0x0000000000000000000000000000000000000000',
            amount: '0'
          }

          const authorized = this.configManager.getConfig().seamlessAccount?.authorized
          const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
          if (config.seamlessMode && authorized && seamlessWallet) {

            // if (needsApproval) {
            //   const approvalResult = await this.utils.approveAuthorization({
            //     chainId: params.chainId,
            //     quoteAddress: params.executionFeeToken,
            //     amount: ethers.MaxUint256.toString(),
            //     signer: seamlessWallet as Signer,
            //   });

            //   if (approvalResult.code !== 0) {
            //     throw new Error(approvalResult.message);
            //   }
            // }

            const isEnoughGas = await this.utils.checkSeamlessGas(params.address, params.chainId)

            if (!isEnoughGas) {
              throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
            }

            const forwarderContract = await getForwarderContract(params.chainId)

            const brokerContract = await getSeamlessBrokerContract(
              this.configManager.getConfig().brokerAddress,
              seamlessWallet as Signer
            );
            let functionHash = ''

            if (!params.positionId) {
              functionHash = brokerContract.interface.encodeFunctionData('placeOrdersWithSalt', [
                depositData, ['1', '1'], data
              ])
            } else {
              functionHash = brokerContract.interface.encodeFunctionData('placeOrdersWithPosition', [
                depositData, [params.positionId.toString(), params.positionId.toString()], data
              ])
            }

            const nonce = await forwarderContract.nonces(seamlessWallet.address)

            const forwardTxParams = {
              from: seamlessWallet.address ?? '',
              to: this.configManager.getConfig().brokerAddress,
              value: '0',
              gas: '800000',
              deadline: dayjs().add(60, 'minute').unix(),
              data: functionHash,
              nonce: nonce.toString(),
            }

            this.logger.info("createPositionTpSlOrder forward tx params --->", forwardTxParams)

            const rs = await this.seamless.forwarderTx(forwardTxParams, params.chainId, seamlessWallet as Signer);

            return {
              code: 0,
              message: "createPositionTpSlOrder success",
              data: rs,
            };
          }

          // if (needsApproval) {
          //   const approvalResult = await this.utils.approveAuthorization({
          //     chainId: params.chainId,
          //     quoteAddress: params.executionFeeToken,
          //     amount: ethers.MaxUint256.toString(),
          //     spenderAddress: getContractAddressByChainId(params.chainId).TRADING_ROUTER,
          //   });

          //   if (approvalResult.code !== 0) {
          //     throw new Error(approvalResult.message);
          //   }
          // }

          let transaction
          if (!params.positionId) {
            this.logger.info("createPositionTpSlOrder salt position data--->", data);

            const positionId = 1
            const gasLimit = await brokerContract.placeOrdersWithSalt.estimateGas(depositData, [positionId.toString(), positionId.toString()], data);

            transaction = await brokerContract.placeOrdersWithSalt(depositData, [positionId.toString(), positionId.toString()], data, {
              gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
            });
          } else {
            const gasLimit = await brokerContract.placeOrdersWithPosition.estimateGas(depositData, [params.positionId.toString(), params.positionId.toString()], data);

            transaction = await brokerContract.placeOrdersWithPosition(depositData, [params.positionId.toString(), params.positionId.toString()], data, {
              gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
            });
          }

          // this.logger.info("Transaction sent:", transaction.hash);
          // this.logger.info("Waiting for confirmation...");

          const receipt = await transaction.wait();
          // this.logger.info(
          //   "Transaction confirmed in block:",
          //   receipt?.blockNumber
          // );

          // this.logger.info("createDecreaseOrder receipt--->", receipt);
          // const orderId = this.utils.getOrderIdFromTransaction(receipt);

          const result = {
            success: true,
            // orderId,
            transactionHash: transaction.hash,
            blockNumber: receipt?.blockNumber,
            gasUsed: receipt?.gasUsed?.toString(),
            status: receipt?.status === 1 ? "success" : "failed",
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
        };

        const depositData = {
          token: '0x0000000000000000000000000000000000000000',
          amount: '0'
        }

        // const needsApproval = await this.utils.needsApproval(
        //   params.address,
        //   params.chainId,
        //   params.executionFeeToken,
        //   networkFee.toString(),
        //   getContractAddressByChainId(params.chainId).TRADING_ROUTER,
        // );

        const authorized = this.configManager.getConfig().seamlessAccount?.authorized
        const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
        if (config.seamlessMode && authorized && seamlessWallet) {

          // if (needsApproval) {
          //   const approvalResult = await this.utils.approveAuthorization({
          //     chainId: params.chainId,
          //     quoteAddress: params.executionFeeToken,
          //     amount: ethers.MaxUint256.toString(),
          //     signer: seamlessWallet as Signer,
          //   });

          //   if (approvalResult.code !== 0) {
          //     throw new Error(approvalResult.message);
          //   }
          // }

          const isEnoughGas = await this.utils.checkSeamlessGas(params.address, params.chainId)

          if (!isEnoughGas) {
            throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
          }

          const forwarderContract = await getForwarderContract(params.chainId)

          const brokerContract = await getSeamlessBrokerContract(
            this.configManager.getConfig().brokerAddress,
            seamlessWallet as Signer
          );
          let functionHash = ''

          if (!params.positionId) {
            functionHash = brokerContract.interface.encodeFunctionData('placeOrderWithSalt', [
              '1', depositData, data
            ])
          } else {
            functionHash = brokerContract.interface.encodeFunctionData('placeOrderWithPosition', [
              params.positionId.toString(), depositData, data
            ])
          }

          const nonce = await forwarderContract.nonces(seamlessWallet.address)

          const forwardTxParams = {
            from: seamlessWallet.address ?? '',
            to: this.configManager.getConfig().brokerAddress,
            value: '0',
            gas: '800000',
            deadline: dayjs().add(60, 'minute').unix(),
            data: functionHash,
            nonce: nonce.toString(),
          }

          this.logger.info("createPositionTpSlOrder forward tx params --->", forwardTxParams)

          const rs = await this.seamless.forwarderTx(forwardTxParams, params.chainId, seamlessWallet as Signer);

          return {
            code: 0,
            message: "createPositionTpSlOrder success",
            data: rs,
          };
        }

        // if (needsApproval) {
        //   const approvalResult = await this.utils.approveAuthorization({
        //     chainId: params.chainId,
        //     quoteAddress: params.executionFeeToken,
        //     amount: ethers.MaxUint256.toString(),
        //     spenderAddress: getContractAddressByChainId(params.chainId).TRADING_ROUTER,
        //   });

        //   if (approvalResult.code !== 0) {
        //     throw new Error(approvalResult.message);
        //   }
        // }

        let transaction;
        if (!params.positionId) {
          this.logger.info("createPositionTpOrSlOrder salt position data--->", data);
          const positionId = 1//await this.createPositionId(params.poolId, params.address as `0x${string}`, params.direction, BigInt(1));
          const gasLimit = await brokerContract.placeOrderWithSalt.estimateGas(positionId.toString(), depositData, data);

          transaction = await brokerContract.placeOrderWithSalt(positionId.toString(), depositData, data, {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          });
        } else {
          this.logger.info("createPositionTpOrSlOrder nft position data--->", data);
          const gasLimit = await brokerContract.placeOrderWithPosition.estimateGas(params.positionId.toString(), depositData, data);
          transaction = await brokerContract.placeOrderWithPosition(params.positionId.toString(), depositData, data, {
            gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[params.chainId as ChainId]) / 100n,
          });
        }

        // this.logger.info("Transaction sent:", transaction.hash);
        // this.logger.info("Waiting for confirmation...");

        const receipt = await transaction.wait();
        // this.logger.info(
        //   "Transaction confirmed in block:",
        //   receipt?.blockNumber
        // );

        // this.logger.info("createDecreaseOrder receipt--->", receipt);
        // const orderId = this.utils.getOrderIdFromTransaction(receipt);

        const result = {
          success: true,
          // orderId,
          transactionHash: transaction.hash,
          blockNumber: receipt?.blockNumber,
          gasUsed: receipt?.gasUsed?.toString(),
          status: receipt?.status === 1 ? "success" : "failed",
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
      const config: MyxClientConfig = this.configManager.getConfig();


      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
      if (config.seamlessMode && authorized && seamlessWallet) {

        const isEnoughGas = await this.utils.checkSeamlessGas(config.seamlessAccount?.masterAddress as string, chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }

        const forwarderContract = await getForwarderContract(chainId)

        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        let functionHash = brokerContract.interface.encodeFunctionData('cancelOrders', [orderIds])

        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: this.configManager.getConfig().brokerAddress,
          value: '0',
          gas: '800000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("create decrease order forward tx params --->", forwardTxParams)

        const rs = await this.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

        return {
          code: 0,
          message: "create decrease order success",
          data: rs,
        };
      }

      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        chainId,
        this.configManager.getConfig().brokerAddress
      );

      const tx = await brokerContract.cancelOrders(orderIds);
      await tx.wait();
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
      const config: MyxClientConfig = this.configManager.getConfig();

      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(config.seamlessAccount?.masterAddress as string, chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }

        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        const forwarderContract = await getForwarderContract(chainId)
        let functionHash = brokerContract.interface.encodeFunctionData('cancelOrder', [BigInt(orderId)])

        const nonce = await forwarderContract.nonces(seamlessWallet.address)

        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: this.configManager.getConfig().brokerAddress,
          value: '0',
          gas: '800000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("createIncreaseOrder forward tx params --->", forwardTxParams)

        const rs = await this.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

        return {
          code: 0,
          message: "cancel order success",
          data: rs,
        };
      }

      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        chainId,
        this.configManager.getConfig().brokerAddress
      );

      const tx = await brokerContract.cancelOrder(orderId);
      await tx.wait();
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
      const config: MyxClientConfig = this.configManager.getConfig();


      const authorized = this.configManager.getConfig().seamlessAccount?.authorized
      const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
      if (config.seamlessMode && authorized && seamlessWallet) {
        const isEnoughGas = await this.utils.checkSeamlessGas(config.seamlessAccount?.masterAddress as string, chainId)

        if (!isEnoughGas) {
          throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
        }

        const forwarderContract = await getForwarderContract(chainId)

        const brokerContract = await getSeamlessBrokerContract(
          this.configManager.getConfig().brokerAddress,
          seamlessWallet as Signer
        );
        let functionHash = brokerContract.interface.encodeFunctionData('cancelOrders', [orderIds])
  
        const nonce = await forwarderContract.nonces(seamlessWallet.address)
  
        const forwardTxParams = {
          from: seamlessWallet.address ?? '',
          to: this.configManager.getConfig().brokerAddress,
          value: '0',
          gas: '800000',
          deadline: dayjs().add(60, 'minute').unix(),
          data: functionHash,
          nonce: nonce.toString(),
        }

        this.logger.info("cancel orders forward tx params --->", forwardTxParams)

        const rs = await this.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

        return {
          code: 0,
          message: "cancel orders success",
          data: rs,
        };
      }


      if (!config.signer) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }
      const brokerContract = await getBrokerSingerContract(
        chainId,
        this.configManager.getConfig().brokerAddress
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

  async updateOrderTpSl(params: UpdateOrderParams, quoteAddress: string, chainId: number, address: string, marketId: string, isTpSlOrder?: boolean) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const networkFee = await this.utils.getNetworkFee(marketId, chainId)

    const data = {
      orderId: params.orderId,
      size: params.size,
      price: params.price,
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

    const authorized = this.configManager.getConfig().seamlessAccount?.authorized
    const seamlessWallet = this.configManager.getConfig().seamlessAccount?.wallet
    if (config.seamlessMode && authorized && seamlessWallet) {
      const isEnoughGas = await this.utils.checkSeamlessGas(config.seamlessAccount?.masterAddress as string, chainId)

      if (!isEnoughGas) {
        throw new MyxSDKError(MyxErrorCode.InsufficientBalance, "Insufficient relay fee");
      }

      const brokerContract = await getSeamlessBrokerContract(
        this.configManager.getConfig().brokerAddress,
        seamlessWallet as Signer
      );
      const forwarderContract = await getForwarderContract(chainId)
      let functionHash = brokerContract.interface.encodeFunctionData('updateOrder', [depositData, data])

      const nonce = await forwarderContract.nonces(seamlessWallet.address)

      const forwardTxParams = {
        from: seamlessWallet.address ?? '',
        to: this.configManager.getConfig().brokerAddress,
        value: '0',
        gas: '800000',
        deadline: dayjs().add(60, 'minute').unix(),
        data: functionHash,
        nonce: nonce.toString(),
      }

      this.logger.info("createIncreaseOrder forward tx params --->", forwardTxParams)

      const rs = await this.seamless.forwarderTx(forwardTxParams, chainId, seamlessWallet as Signer);

      return {
        code: 0,
        message: "update order success",
        data: rs,
      };
    }


    if (!config.signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }

    const brokerContract = await getBrokerSingerContract(
      chainId,
      config.brokerAddress
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
          amount: ethers.MaxUint256.toString(),
          spenderAddress: getContractAddressByChainId(chainId).TRADING_ROUTER,
        });

        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }

      const gasLimit = await brokerContract.updateOrder.estimateGas(depositData, data);

      const request = await brokerContract.updateOrder(depositData, data, {
        gasLimit: (gasLimit * TRADE_GAS_LIMIT_RATIO[chainId as ChainId]) / 100n,
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
      console.error("Error fetching orders:", error);
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
