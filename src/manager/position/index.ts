import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
import oracleAbi from "@/abi/MYXOracle.json";
import {
  GetHistoryOrdersParams,
  getPositionHistory,
  getPositions,
  OracleType,
} from "@/api";
import { Utils } from "../utils";
import brokerAbi from "@/abi/Broker.json";
import { getContract } from "@/web3";
import { MyxErrorCode, MyxSDKError } from "../error/const";

export class Position {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;

  constructor(configManager: ConfigManager, logger: Logger, utils: Utils) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
  }

  async listPositions() {
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
      const res = await getPositions(accessToken, config.chainId);
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      console.error("Error fetching positions:", error);
      return {
        code: -1,
        message: "Failed to fetch positions",
      };
    }
  }

  async getPositionHistory(params: GetHistoryOrdersParams) {
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidAccessToken,
        "Invalid access token"
      );
    }
    const res = await getPositionHistory({ accessToken, ...params });
    return {
      code: 0,
      data: res.data,
    };
  }
  /**
   * @desc temp skip eip7702
   * @todo adjustCollateral 调整保证金
   */
  // async adjustCollateral({ poolId, positionId, adjustAmount }: { poolId: string, positionId: string, adjustAmount: string }) {
  //   const config: MyxClientConfig = this.configManager.getConfig();

  //   console.log("adjustCollateral-->", { poolId, positionId, adjustAmount })
  //   try {
  //     const oraclePrice = await this.utils.getOraclePrice(poolId);
  //     console.log("oraclePrice-->", oraclePrice);

  //     const eip7702DelegationAddress = getContractAddressByChainId(
  //       config.chainId
  //     ).EIP7702Delegation;

  //     const oracleAddress = getContractAddressByChainId(
  //       config.chainId
  //     ).ORACLE;

  //     const brokerAddress = getContractAddressByChainId(
  //       config.chainId
  //     ).BROKER;

  //     // 获取用户地址
  //     const userAddress = await config.signer.getAddress();
  //     const nonce = await config.signer.getNonce();

  //     // 1️⃣ 构造签名消息
  //     const message = {
  //       chainId: config.chainId,
  //       delegate: eip7702DelegationAddress,
  //       nonce: nonce,
  //     };

  //     const signature = await config.signer.signMessage(JSON.stringify(message));

  //     // 3️⃣ 构造 authorizationList
  //     const sig = signature.slice(2);
  //     const r = `0x${sig.slice(0, 64)}` as `0x${string}`;
  //     const s = `0x${sig.slice(64, 128)}` as `0x${string}`;
  //     const v = parseInt(sig.slice(128, 130), 16);

  //     const authorizationList = [
  //       {
  //         chainId: config.chainId,
  //         address: eip7702DelegationAddress as `0x${string}`,
  //         nonce: Number(nonce),
  //         r,
  //         s,
  //         yParity: v === 27 ? 0 : 1,
  //       }
  //     ];

  //     const oracleContract = new ethers.Contract(
  //       oracleAddress,
  //       oracleAbi,
  //       config.signer
  //     );

  //     const updatePricesGasLimit = await oracleContract.updatePrices.estimateGas([{
  //       poolId: poolId,
  //       referencePrice: ethers.parseUnits(oraclePrice?.price ?? '0', 30),
  //       oracleUpdateData: oraclePrice?.vaa ?? '0',
  //       publishTime: oraclePrice.publishTime,
  //     }], {
  //       value: oraclePrice.value ?? 1n,
  //     });

  //     // 构造更新价格的数据
  //     const updateParams = {
  //       poolId: poolId,
  //       referencePrice: ethers.parseUnits(oraclePrice?.price ?? '0', 30),
  //       oracleUpdateData: oraclePrice?.vaa ?? '0',
  //       publishTime: oraclePrice.publishTime,
  //     }

  //     const updatePriceData = {
  //       target: oracleAddress,
  //       gas: updatePricesGasLimit,
  //       data: encodeFunctionData({
  //         abi: oracleAbi,
  //         functionName: 'updatePrices',
  //         args: [[updateParams]],
  //       }),
  //       value: oraclePrice.value ?? 1n,
  //     }

  //     // 构造调整保证金的数据
  //     const adjustCollateralData = {
  //       target: brokerAddress,
  //       gas: 10000000n,
  //       data: encodeFunctionData({
  //         abi: brokerAbi,
  //         functionName: 'adjustCollateral',
  //         args: [positionId, adjustAmount],
  //       }),
  //       value: '0'
  //     }

  //     // 编码批量执行的数据
  //     const batchExecuteData = encodeFunctionData({
  //       abi: eip7702DelegationAbi,
  //       functionName: 'updatePriceAndBatchExecute',
  //       args: [[updatePriceData, adjustCollateralData]],
  //     });

  //     // 4️⃣ 发送交易
  //     let hash: string;

  //     if (config.walletClient) {
  //       hash = await config.walletClient.sendTransaction({
  //         account: userAddress as `0x${string}`,
  //         to: userAddress as `0x${string}`,
  //         data: batchExecuteData as `0x${string}`,
  //         value: BigInt(oraclePrice?.value ?? 1n),
  //         gas: 10000000n,
  //         authorizationList,
  //         type: 'eip7702',
  //       } as any);
  //     } else {
  //       throw new Error('EIP-7702 交易目前只支持使用 walletClient，请在配置中提供 walletClient');
  //     }

  //     console.log("Transaction hash->", hash);

  //     return {
  //       code: 0,
  //       data: { hash },
  //       message: "调整保证金交易已提交"
  //     };

  //   } catch (error) {
  //     console.log('error-->', error)
  //     return {
  //       code: -1,
  //       // @ts-ignore
  //       message: error?.message,
  //     };
  //   }
  // }

  async adjustCollateral({
    poolId,
    positionId,
    adjustAmount,
    quoteToken,
    poolOracleType,
  }: {
    poolId: string;
    positionId: string;
    adjustAmount: string;
    quoteToken: string;
    poolOracleType: OracleType
  }) {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (!config.signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }

    this.logger.debug("adjustCollateral-->", {
      poolId,
      positionId,
      adjustAmount,
      quoteToken,
    });
    try {
      /**
       * fetch oracle price
       */
      const priceData = await this.utils.getOraclePrice(poolId);
      if (!priceData) {
        throw new Error("Failed to get price data");
      }
      const updateParams = {
        poolId: poolId,
        referencePrice: ethers.parseUnits(priceData?.price ?? "0", 30),
        oracleUpdateData: priceData?.vaa ?? "0",
        publishTime: priceData.publishTime,
        oracleType: poolOracleType,
      };

      const contractAddress = getContractAddressByChainId(config.chainId);

      // adjust collateral check and approve
      if (Number(adjustAmount) > 0) {
        this.logger.debug("adjust collateral check and approve-->", {
          quoteToken,
          adjustAmount,
          spenderAddress: contractAddress.POSITION_MANAGER,
        });
        const needsApproval = await this.utils.needsApproval(
          quoteToken,
          adjustAmount,
          contractAddress.POSITION_MANAGER
        );
        this.logger.debug("adjust collateral needs approval-->", {
          needsApproval,
        });

        if (needsApproval) {
          this.logger.debug("adjust collateral approve-->", {
            quoteToken,
            amount: ethers.MaxUint256.toString(),
            spenderAddress: contractAddress.POSITION_MANAGER,
          });
          const approvalResult = await this.utils.approveAuthorization({
            quoteAddress: quoteToken,
            amount: ethers.MaxUint256.toString(),
            spenderAddress: contractAddress.POSITION_MANAGER,
          });
          if (approvalResult.code !== 0) {
            throw new Error(approvalResult.message);
          }
        }
      }

      /**
       * call broker contract
       */
      const brokerContract = getContract(
        config.brokerAddress,
        brokerAbi,
        config.signer
      );

      this.logger.debug("updatePriceAndAdjustCollateral-->", {
        updateParams,
        positionId,
        adjustAmount,
        useAccountBalance: false,
      });

      const transaction = await brokerContract.updatePriceAndAdjustCollateral(
        [updateParams],
        positionId,
        adjustAmount,
        false,
        {
          value: BigInt(priceData?.value ?? "1"),
          gas: 10000000n,
        }
      );
      const hash = await transaction.wait();
      return {
        code: 0,
        data: { hash },
        message: "Adjust collateral transaction submitted",
      };
    } catch (error) {
      console.log(error, 'error')
      const errorMessage = await this.utils.getErrorMessage(error);
      this.logger.error("adjustCollateral error-->", errorMessage);
      return {
        code: -1,
        message: errorMessage,
      };
    }
  }
}
