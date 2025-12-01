import { Signer } from "ethers";
import { MAINNET_CHAIN_IDS, TESTNET_CHAIN_IDS } from "../const";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { LogLevel } from "@/logger";
import { WebSocketConfig } from "@/manager/subscription/websocket/types";
import { WalletClient } from "viem";
import { ethers } from "ethers";

interface AccessTokenResponse {
  accessToken: string;
  expireAt: number;
}

interface GetAccessTokenQueueItem {
  resolve: (token: string | null) => void;
  reject: (error: any) => void;
  forceRefresh: boolean;
}

export interface MyxClientConfig {
  /**
   * @deprecated 为了更灵活的执行操作应该在具体方法中由外部传入chainId，这个字段将在未来版本中废弃
   */
  chainId: number;
  signer?: Signer;
  seamlessAccount?: {
    masterAddress: string;
    wallet: ethers.Wallet | null;
    authorized: boolean;
  };
  walletClient?: WalletClient;
  brokerAddress: string;
  isTestnet?: boolean;
  poolingInterval?: number;
  seamlessMode?: boolean;
  socketConfig?: Partial<Omit<WebSocketConfig, "url">>;
  logLevel?: LogLevel;
  getAccessToken?:
  | (() => Promise<AccessTokenResponse | undefined>)
  | (() => AccessTokenResponse | undefined); // 前端提供的获取 accessToken 的方法
}

export class ConfigManager {
  private config: MyxClientConfig;
  private accessToken?: string;
  private accessTokenExpiry?: number; // accessToken 过期时间

  constructor(config: MyxClientConfig) {
    const mergedConfig: MyxClientConfig = {
      isTestnet: false,
      ...config,
    };
    this.validateConfig(mergedConfig);
    this.config = mergedConfig;
  }

  public clear() {
    this.accessToken = undefined;
    this.accessTokenExpiry = undefined;
    this.config = {
      ...this.config,
      signer: undefined,
      getAccessToken: undefined,
    };
  }

  public startSeamlessMode(open: boolean) {
    this.config = {
      ...this.config,
      seamlessMode: open
    };

    return this.config;
  }

  public updateSeamlessWallet({ wallet, authorized, masterAddress }: { wallet?: ethers.Wallet, authorized?: boolean, masterAddress?: string }) {
    this.config = {
      ...this.config,
      seamlessAccount: {
        masterAddress: masterAddress ?? '',
        wallet: wallet ?? null,
        authorized: authorized ?? false,
      }
    };
  }

  public updateClientChainId(chainId: number, brokerAddress: string) {
    this.config = {
      ...this.config,
      chainId,
      brokerAddress
    };
  }

  public auth(params: Pick<MyxClientConfig, "signer" | "getAccessToken">) {
    // before auth, clear the accessToken and accessTokenExpiry
    this.clear();
    // then set the new config
    this.config = {
      ...this.config,
      ...params,
    };
    // then validate the config
    this.validateConfig(this.config);
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

  /**
   * 获取有效的 accessToken，自动处理获取和刷新
   * @param forceRefresh 是否强制刷新
   * @returns Promise<string | null> 有效的 accessToken 或 null
   */

  private _getAccessTokenQueue: Array<GetAccessTokenQueueItem> = [];
  private _isGettingAccessToken = false;
  async getAccessToken(forceRefresh: boolean = false): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this._getAccessTokenQueue.push({
        resolve,
        reject,
        forceRefresh,
      });
      this._processAccessTokenQueue();
    });
  }

  private _processAccessTokenQueue() {
    if (this._isGettingAccessToken) {
      return;
    }
    this._isGettingAccessToken = true;
    const item = this._getAccessTokenQueue.shift();
    if (item) {
      this._getAccessToken(item.forceRefresh)
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this._isGettingAccessToken = false;
          if (this._getAccessTokenQueue.length > 0) {
            this._processAccessTokenQueue();
          }
        });
    } else {
      this._isGettingAccessToken = false;
    }
  }

  private async _getAccessToken(
    forceRefresh: boolean = false
  ): Promise<string | null> {
    // 如果当前 token 有效且不需要强制刷新，直接返回
    if (!forceRefresh && this.isAccessTokenValid()) {
      this._isGettingAccessToken = false;
      return this.accessToken!;
    }

    // 如果没有提供获取 token 的方法，返回 null
    if (!this.config.getAccessToken) {
      console.warn("No getAccessToken method provided in config");
      return null;
    }

    try {
      console.log("Automatically fetching accessToken...");

      // 调用前端提供的方法获取新的 token
      const response = await this.config.getAccessToken();

      if (response && response.accessToken) {
        // expireAt 是到期时间戳，需要转换为有效期秒数
        let expiryInSeconds = 3600; // 默认1小时
        if (response.expireAt) {
          const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
          expiryInSeconds = response.expireAt - currentTime; // 计算剩余有效期

          // 确保有效期为正数，如果已过期则使用默认值
          if (expiryInSeconds <= 0) {
            console.warn("Received expired token, using default expiry");
            expiryInSeconds = 3600;
          }
        }

        this.setAccessToken(response.accessToken, expiryInSeconds);
        console.log("✅ AccessToken fetched and stored successfully", {
          expiryInSeconds,
          expireAt: response.expireAt,
        });
        return response.accessToken;
      } else {
        console.warn("❌ Received empty accessToken");
        return null;
      }
    } catch (error) {
      console.error("❌ Failed to fetch accessToken:", error);
      return null;
    }
  }

  /**
   * 设置 accessToken 和过期时间
   * @param token accessToken
   * @param expiryInSeconds token 有效期（秒），默认1小时
   */
  setAccessToken(token: string, expiryInSeconds: number = 3600): void {
    this.accessToken = token;
    this.accessTokenExpiry = Date.now() + expiryInSeconds * 1000;
  }

  /**
   * 获取当前存储的 accessToken（不会触发刷新）
   * @returns string | undefined 当前的 accessToken
   */
  getCurrentAccessToken(): string | undefined {
    return this.accessToken;
  }

  /**
   * 检查当前 accessToken 是否有效
   * @returns boolean token 是否有效
   */
  isAccessTokenValid(): boolean {
    if (
      !this.accessToken ||
      !this.accessTokenExpiry ||
      !this.config.getAccessToken ||
      !this.config.signer
    ) {
      return false;
    }
    return Date.now() < this.accessTokenExpiry;
  }

  /**
   * 清除 accessToken
   */
  clearAccessToken(): void {
    this.accessToken = undefined;
    this.accessTokenExpiry = undefined;
  }

  getConfig() {
    return this.config;
  }
}
