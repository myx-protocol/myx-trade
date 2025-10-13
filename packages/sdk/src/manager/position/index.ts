import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
import oracleAbi from "@/abi/MYXOracle.json";
import { getPositions } from "@/api";
import { Utils } from "../utils";
import eip7702DelegationAbi from "@/abi/EIP7702Delegation.json";


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

  async adjustCollateral({poolId, positionId, adjustAmount}: {poolId: string, positionId: string, adjustAmount: string}) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const spenderAddress = getContractAddressByChainId(
      config.chainId
    ).EIP7702Delegation;

    const eip7702DelegationContract = new ethers.Contract(
      spenderAddress,
      eip7702DelegationAbi,
      config.signer
    );
    try {
      const oraclePrice = await this.utils.getOraclePrice(poolId);

      console.log("oraclePrice-->", oraclePrice);
      console.log('positionId-->', positionId);
      console.log('adjustAmount-->', adjustAmount);
      console.log('eip7702DelegationContract-->', eip7702DelegationContract)
      // const gasLimit = await eip7702DelegationContract.updatePriceAndBatchExecute.estimateGas(positionId);

    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }
}
