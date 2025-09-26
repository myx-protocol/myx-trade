import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
import positionManagerAbi from "@/abi/PositionManager.json";
import broker_abi from "@/abi/Broker.json";
import { getPositions } from "@/api";
import { Utils } from "../utils";


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

  async adjustCollateral(positionId: string, adjustAmount: string) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const spenderAddress = getContractAddressByChainId(
      config.chainId
    ).BROKER;

    const brokerContract = new ethers.Contract(
      spenderAddress,
      broker_abi,
      config.signer
    );

    try {
      const gasLimit = await brokerContract.adjustCollateral.estimateGas(positionId, adjustAmount);
      this.logger.info("gasLimit--->", gasLimit);

      const tx = await brokerContract.adjustCollateral(positionId, adjustAmount, {
        gasLimit,
      });
      await tx.wait();
      return {
        code: 0,
        message: "Collateral adjusted success",
      };
    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }
}
