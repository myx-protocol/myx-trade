import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
import oracleAbi from "@/abi/MYXOracle.json";
import { getPositions } from "@/api";
import { Utils } from "../utils";
import eip7702DelegationAbi from "@/abi/EIP7702Delegation.json";
import { encodeFunctionData } from "viem";
import brokerAbi from "@/abi/Broker.json";
import { getContract } from "@/web3";

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
  //       value: oraclePrice.nativeFee
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
  //       value: oraclePrice.nativeFee ?? '1',
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
  //         value: BigInt(oraclePrice?.nativeFee ?? '1'),
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
  }: {
    poolId: string;
    positionId: string;
    adjustAmount: string;
  }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    this.logger.debug("adjustCollateral-->", {
      poolId,
      positionId,
      adjustAmount,
    });
    try {
      /**
       * fetch oracle price
       */
      const oraclePrice = await this.utils.getOraclePrice(poolId);
      const updateParams = {
        poolId: poolId,
        referencePrice: ethers.parseUnits(oraclePrice?.price ?? "0", 30),
        oracleUpdateData: oraclePrice?.vaa ?? "0",
        publishTime: oraclePrice.publishTime,
      };

      /**
       * call broker contract
       */
      const brokerAddress = getContractAddressByChainId(config.chainId).BROKER;
      const brokerContract = getContract(
        brokerAddress,
        brokerAbi,
        config.signer
      );

      this.logger.debug("updatePriceAndAdjustCollateral-->", {
        updateParams,
        positionId,
        adjustAmount,
      });

      const transaction = await brokerContract.updatePriceAndAdjustCollateral([updateParams], positionId, adjustAmount, true);
      const hash = await transaction.wait();
      return { code: 0, data: { hash }, message: "Adjust collateral transaction submitted" };
    } catch (error) {
      this.logger.error("adjustCollateral error-->", error);
      return {
        code: -1,
        message: "Failed to adjust collateral",
      };
    }
  }
}
