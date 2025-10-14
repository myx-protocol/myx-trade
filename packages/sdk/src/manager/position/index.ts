import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
import oracleAbi from "@/abi/MYXOracle.json";
import { getPositions } from "@/api";
import { Utils } from "../utils";
import eip7702DelegationAbi from "@/abi/EIP7702Delegation.json";
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { http } from "viem";
import { Account } from "viem";
import { encodeFunctionData } from "viem";
import brokerAbi from "@/abi/Broker.json";
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
      console.error('Error fetching positions:', error);
      return {
        code: -1,
        message: "Failed to fetch positions",
      };
    }
  }

  async adjustCollateral({ poolId, positionId, adjustAmount }: { poolId: string, positionId: string, adjustAmount: string }) {
    const config: MyxClientConfig = this.configManager.getConfig();

    console.log("adjustCollateral-->", { poolId, positionId, adjustAmount })
    try {
      const oraclePrice = await this.utils.getOraclePrice(poolId);
      console.log("oraclePrice-->", oraclePrice);
      const eip7702DelegationAddress = getContractAddressByChainId(
        config.chainId
      ).EIP7702Delegation;

      const oracleAddress = getContractAddressByChainId(
        config.chainId
      ).ORACLE;

      const brokerAddress = getContractAddressByChainId(
        config.chainId
      ).BROKER;

      const oracleContract = new ethers.Contract(
        oracleAddress,
        oracleAbi,
        config.signer
      );

      const updatePricesGasLimit = await oracleContract.updatePrices.estimateGas([{
        poolId: poolId,
        referencePrice: ethers.parseUnits(oraclePrice?.price ?? '0', 30),
        oracleUpdateData: oraclePrice?.vaa ?? '0',
        publishTime: oraclePrice.publishTime,
      }], {
        value: oraclePrice.nativeFee
      });

      const updateParams = {
        poolId: poolId,
        referencePrice: ethers.parseUnits(oraclePrice?.price ?? '0', 30),
        oracleUpdateData: oraclePrice?.vaa ?? '0',
        publishTime: oraclePrice.publishTime,
      }

      const updatePriceData = {
        target: oracleAddress,
        gas: updatePricesGasLimit,
        data: encodeFunctionData({
          abi: oracleAbi,
          functionName: 'updatePrices',
          args: [[updateParams]],
        }),
        value: oraclePrice.nativeFee ?? '1',
      }

      const adjustParams = [positionId, adjustAmount]

      const adjustCollateralData = {
        target: brokerAddress,
        gas: 10000000n,
        data: encodeFunctionData({
          abi: brokerAbi,
          functionName: 'adjustCollateral',
          args: adjustParams,
        }),
        value: '0'
      }

      const account = privateKeyToAccount('0x579ba5df60f80e975cfa3f1441f765db765fe0ad9b6e2c5754a0dc994e2fc3de')

      const walletClient = createWalletClient({
        account: account,
        chain: arbitrumSepolia,
        transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
      })

      const authorization1 = await walletClient?.signAuthorization({
        account: account as Account,
        contractAddress: eip7702DelegationAddress as `0x${string}`,
        // chainId: 0,
        nonce: 180,
        executor: 'self'
      });

      const data3 = encodeFunctionData({
        abi: eip7702DelegationAbi,
        functionName: 'updatePriceAndBatchExecute',
        args: [[updatePriceData, adjustCollateralData]],
      })

      console.log("data3->", data3)

      const hash = await walletClient?.sendTransaction({
        to: account.address as `0x${string}`,
        authorizationList: [authorization1!],
        type: 'eip7702',
        data: data3,
        gas: 10000000n,
        override: {
          value: oraclePrice?.nativeFee ?? '1',
        }
      })


      console.log("hash->", hash)

    } catch (error) {
      console.log('error-->', error)
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }
}
