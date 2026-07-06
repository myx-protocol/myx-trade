import { ConfigManager } from "../config/index.js";
import { Logger } from "@/logger";

import { GetHistoryOrdersParams } from "@/api";
import { GetPositionTransferParams } from "../api/type.js";
import { Utils } from "../utils/index.js";
import { Address, maxUint256 } from "viem";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import {
  getExecutionPoolSingerContract,
  getForwarderContract,
} from "@/web3/providers";
import { Account } from "../account/index.js";
import { Api } from "../api/index.js";
import { getContractAddressByChainId } from "@/config/address/index.js";
import TradingRouter_abi from "@/abi/TradingRouter.json";
import PositionManager_abi from "@/abi/PositionManager.json";
import {
  execution,
  getGasByRatio,
  transactions,
  signAndSubmit,
} from "@/common/index.js";
export class Position {
  private configManager: ConfigManager;
  private logger: Logger;
  private utils: Utils;
  private account: Account;
  private api: Api;
  constructor(
    configManager: ConfigManager,
    logger: Logger,
    utils: Utils,
    account: Account,
    api: Api,
  ) {
    this.configManager = configManager;
    this.logger = logger;
    this.utils = utils;
    this.account = account;
    this.api = api;
  }

  async listPositions(address: string, positionId?: string) {
    // Auto-fetch accessToken; refresh if missing or expired
    const accessToken = await this.configManager.getAccessToken();

    try {
      const res = await this.api.getPositions({
        accessToken: accessToken ?? "",
        address: address,
        positionId: positionId,
      });
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      this.logger.error("Error fetching positions:", error);
      return {
        code: -1,
        message: "Failed to fetch positions",
      };
    }
  }

  async getPositionHistory(params: GetHistoryOrdersParams, address: string) {
    const accessToken = (await this.configManager.getAccessToken()) ?? "";

    const res = await this.api.getPositionHistory({
      accessToken,
      ...params,
      address: address,
    });
    return {
      code: 0,
      data: res.data,
    };
  }

  async getForwardEip712Domain(chainId: number) {
    const forwarderContract = await getForwarderContract(chainId);
    const forwarderJsonRpcContractDomain =
      await forwarderContract.read.eip712Domain();

    const domain = {
      name: forwarderJsonRpcContractDomain[1],
      version: forwarderJsonRpcContractDomain[2],
      chainId: forwarderJsonRpcContractDomain[3],
      verifyingContract: forwarderJsonRpcContractDomain[4],
    };

    return domain;
  }

  async adjustCollateral({
    poolId,
    positionId,
    adjustAmount,
    quoteToken,
    chainId,
    address,
  }: {
    poolId: string;
    positionId: string;
    adjustAmount: string;
    quoteToken: string;
    chainId: number;
    address: string;
  }) {
    try {
      let needsApproval = false;

      if (Number(adjustAmount) > 0) {
        needsApproval = await this.utils.needsApproval(
          address,
          chainId,
          quoteToken,
          adjustAmount,
          getContractAddressByChainId(chainId).TRADING_ROUTER,
        );
      }

      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      let depositAmount = BigInt(0);

      const used = BigInt(adjustAmount) > 0 ? BigInt(adjustAmount) : 0n;
      const availableRes = await this.account.getAvailableMarginBalance({
        poolId,
        chainId,
        address,
      });
      const availableAccountMarginBalance =
        availableRes.code === 0 ? (availableRes.data ?? 0n) : 0n;
      let diff = BigInt(0);
      if (availableAccountMarginBalance < used) {
        diff = used - availableAccountMarginBalance;
        depositAmount = diff;
      }

      const depositData = {
        token: quoteToken,
        amount: depositAmount.toString(),
      };

      if (needsApproval) {
        const approvalResult = await this.utils.approveAuthorization({
          chainId,
          quoteAddress: quoteToken,
          amount: maxUint256.toString(),
          spenderAddress: getContractAddressByChainId(chainId).TRADING_ROUTER,
        });
        if (approvalResult.code !== 0) {
          throw new Error(approvalResult.message);
        }
      }
      const tradingRouterAddress =
        getContractAddressByChainId(chainId).TRADING_ROUTER;

      const { hexData, executionGasFee } =
        await execution.buildHexDataAndExecutionGasFee({
          abi: TradingRouter_abi as any,
          method: "adjustCollateral",
          args: [depositData, positionId, adjustAmount],
          chainId,
        });

      const { createAt, txId, signData, gasEscrow } =
        await execution.buildSignData({
          from: address as `0x${string}`,
          to: tradingRouterAddress as `0x${string}`,
          data: hexData,
          chainId,
        });

      const executionPoolContract =
        await getExecutionPoolSingerContract(chainId);

      const _gasLimit = await executionPoolContract.estimateGas!.submit(
        [
          txId,
          { ...signData, createdAt: BigInt(createAt), gasEscrow },
          [poolId],
        ],
        { value: executionGasFee },
      );
      const { gasLimit, gasPrice } = await getGasByRatio(chainId, _gasLimit);
      const hash = await executionPoolContract.write!.submit(
        [
          txId,
          {
            ...signData,
            createdAt: BigInt(createAt),
            gasEscrow,
          },
          [poolId],
        ],
        {
          value: executionGasFee,
          gasLimit,
          gasPrice,
        },
      );
      const receipt = await transactions.waitForTransactionReceipt(
        chainId,
        hash,
      );
      return {
        code: 0,
        data: { hash, txId, receipt },
      };
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async getPositionTransferHistory(params: GetPositionTransferParams) {
    try {
      const res = await this.api.getPositionTransfer(params);
      return {
        code: 0,
        data: res.data,
      };
    } catch (error) {
      this.logger.error("Error fetching position transfer history:", error);
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }

  async transferPosition({
    positionId,
    tokenId,
    to,
    poolId,
    chainId,
    address,
  }: {
    positionId: string;
    tokenId: string | null;
    to: string;
    poolId: string;
    chainId: number;
    address: string;
  }) {
    try {
      if (!this.configManager.hasSigner()) {
        throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
      }

      const positionManagerAddress =
        getContractAddressByChainId(chainId).POSITION_MANAGER;

      if (tokenId) {
        // Position is already an NFT — transfer via safeTransferFrom (EIP-712 / ERC2771)
        const { hash, txId, receipt } = await signAndSubmit({
          chainId,
          account: address as Address,
          abi: PositionManager_abi,
          method: "safeTransferFrom",
          args: [address, to, BigInt(tokenId)],
          poolIds: [poolId],
          to: positionManagerAddress as Address,
        });
        return { code: 0, data: { hash, txId, receipt } };
      } else {
        // Position is not yet an NFT — mint and transfer to recipient in one step
        const { hash, txId, receipt } = await signAndSubmit({
          chainId,
          account: address as Address,
          abi: PositionManager_abi,
          method: "mintPositionNFT",
          args: [positionId, to],
          poolIds: [poolId],
          to: positionManagerAddress as Address,
        });
        return { code: 0, data: { hash, txId, receipt } };
      }
    } catch (error) {
      return {
        code: -1,
        message: (error as Error).message,
      };
    }
  }
}
