import { ConfigManager, MyxClientConfig } from "../config";
import { Logger } from "@/logger";

import { getContractAddressByChainId } from "@/config/address/index";
import { ethers } from "ethers";
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
    // 自动获取 accessToken，如果没有或过期会自动刷新
    const accessToken = await this.configManager.getAccessToken();
    if (!accessToken) {
      return {
        code: -1,
        message: "Failed to obtain accessToken",
      };
    }

    try {
      const res = await getPositions(accessToken);
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

  async adjustCollateral({
    poolId,
    positionId,
    adjustAmount,
    quoteToken,
    poolOracleType,
    chainId
  }: {
    poolId: string;
    positionId: string;
    adjustAmount: string;
    quoteToken: string;
    poolOracleType: OracleType,
    chainId: number
  }) {
    const config: MyxClientConfig = this.configManager.getConfig();
    if (!config.signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }

    this.logger.debug("adjustCollateral params-->", {
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

      const contractAddress = getContractAddressByChainId(chainId);

      // adjust collateral check and approve
      if (Number(adjustAmount) > 0) {
        this.logger.debug("adjust collateral check and approve-->", {
          quoteToken,
          adjustAmount,
          spenderAddress: contractAddress.Account,
        });
        const needsApproval = await this.utils.needsApproval(
          chainId,
          quoteToken,
          adjustAmount,
        );

        this.logger.debug("adjust collateral needs approval-->", {
          needsApproval,
        });

        if (needsApproval) {
          this.logger.debug("adjust collateral approve-->", {
            quoteToken,
            amount: ethers.MaxUint256.toString(),
            spenderAddress: contractAddress.Account,
          });
          const approvalResult = await this.utils.approveAuthorization({
            chainId,
            quoteAddress: quoteToken,
            amount: ethers.MaxUint256.toString(),
            spenderAddress: contractAddress.Account,
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
      });

      this.logger.debug("adjust collateral network fee-->", {
        quoteToken,
        chainId,
      });
      const networkFee = await this.utils.getNetworkFee(quoteToken, chainId);

      this.logger.debug("adjust collateral network fee result-->", {
        networkFee,
      });
      const depositAmount = BigInt(networkFee) + (BigInt(adjustAmount) > 0 ? BigInt(adjustAmount) : 0n);
      this.logger.debug("adjust collateral deposit amount-->", {
        depositAmount,
      });
      const depositData = {
        token: quoteToken,
        amount: depositAmount.toString()
      }

      this.logger.debug("adjust collateral deposit data-->", {
        depositData,
      });

      const transaction = await brokerContract.updatePriceAndAdjustCollateral(
        [updateParams],
        depositData,
        positionId,
        adjustAmount,
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
