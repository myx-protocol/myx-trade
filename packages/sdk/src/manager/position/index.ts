import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
import positionManagerAbi from "@/abi/PositionManager.json";
import broker_abi from "@/abi/Broker.json";
import { getPositions } from "@/api";

export class Position {
  private configManager: ConfigManager;
  private logger: Logger;
  constructor(configManager: ConfigManager, logger: Logger) {
    this.configManager = configManager;
    this.logger = logger;
  }


  async closePosition(positionId: string) {
    const config: MyxClientConfig = this.configManager.getConfig();

    const spenderAddress = getContractAddressByChainId(
      config.chainId
    ).POSITION_MANAGER;

    const positionManagerContract = new ethers.Contract(
      spenderAddress,
      positionManagerAbi,
      config.signer
    );

    console.log('positionId--->', positionId);
    try {
      const gasLimit = await positionManagerContract.closePosition.estimateGas(positionId);
      this.logger.info("gasLimit--->", gasLimit);

      const tx = await positionManagerContract.closePosition(positionId, {
        gasLimit,
      });
      await tx.wait();
      return {
        code: 0,
        message: "Position closed success",
      };
    } catch (error) {
      return {
        code: -1,
        // @ts-ignore
        message: error?.message,
      };
    }
  }

  async listPositions() {
    const config: MyxClientConfig = this.configManager.getConfig();
    const accessToken = await this.configManager.getCurrentAccessToken();
    if (!accessToken) {
      return {
        code: -1,
        message: "accessToken is empty",
      };
    }
    const res = await getPositions(accessToken, config.chainId);
    return {
      code: 0,
      data: res.data,
    };
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
