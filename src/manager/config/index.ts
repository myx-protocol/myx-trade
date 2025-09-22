import { Signer } from "ethers";
import { MAINNET_CHAIN_IDS, TESTNET_CHAIN_IDS } from "../const";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { LogLevel } from "@/logger";
import { WebSocketConfig } from "@/manager/subscription/websocket/types";

export interface MyxClientConfig {
  chainId: number;
  signer: Signer;
  brokerAddress: string;
  isTestnet?: boolean;
  poolingInterval?: number;
  seamlessMode?: boolean;
  seamlessKeyPath?: string;
  seamlessKeyPassword?: string;
  socketConfig?: Partial<Omit<WebSocketConfig, "url">>;
  logLevel?: LogLevel;
}

export class ConfigManager {
  private config: MyxClientConfig;
  constructor(config: MyxClientConfig) {
    const mergedConfig: MyxClientConfig = {
      isTestnet: false,
      ...config,
    };
    this.validateConfig(mergedConfig);
    this.config = mergedConfig;
  }

  private validateConfig(config: MyxClientConfig) {
    const { isTestnet, chainId } = config;

    /**
     * chainId must be in the range of TESTNET_CHAIN_IDS or MAINNET_CHAIN_IDS
     */
    if (isTestnet) {
      if (!TESTNET_CHAIN_IDS.includes(chainId))
        throw new MyxSDKError(
          MyxErrorCode.InvalidChainId,
          `chainId ${chainId} is not in the range of TESTNET_CHAIN_IDS`
        );
    } else {
      if (!MAINNET_CHAIN_IDS.includes(chainId))
        throw new MyxSDKError(
          MyxErrorCode.InvalidChainId,
          `chainId ${chainId} is not in the range of MAINNET_CHAIN_IDS`
        );
    }
  }

  getConfig() {
    return this.config;
  }
}
