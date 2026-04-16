import {
  BETA_ENV_CHAIN_IDS,
  MAINNET_CHAIN_IDS,
  TESTNET_CHAIN_IDS,
} from "../const/index.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { LogLevel, sdkWarn, sdkError } from "@/logger";
import { WebSocketConfig } from "@/manager/subscription/websocket/types";
import { WalletClient } from "viem";
import type { SignerLike, ISigner } from "../../signer/types.js";
import { normalizeSigner } from "../../signer/adapters.js";
import { createWalletClientFromSigner } from "../../signer/viemWalletFromSigner.js";

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
   * @deprecated Pass chainId from outside in each method for flexibility; this field will be removed in a future version
   */
  chainId: number;
  /** ethers v5/v6 Signer, viem WalletClient, or ISigner. Use walletClient when app uses viem to avoid ethers in bundle. */
  signer?: SignerLike;
  // seamlessAccount?: {
  //   masterAddress: string;
  //   wallet: Account | null;
  //   authorized: boolean;
  // };
  walletClient?: WalletClient;
  brokerAddress: string;
  isTestnet?: boolean;
  isBetaMode?: boolean;
  poolingInterval?: number;
  // seamlessMode?: boolean;
  socketConfig?: Partial<Omit<WebSocketConfig, "url">>;
  logLevel?: LogLevel;
  getAccessToken?:
  | (() => Promise<AccessTokenResponse | undefined>)
  | (() => AccessTokenResponse | undefined); // Client-provided method to get accessToken
}

export class ConfigManager {
  private config: MyxClientConfig;
  private accessToken?: string;
  private accessTokenExpiry?: number; // accessToken expiry timestamp
  /** Normalized ISigner when auth({ signer }) is used (ethers or ISigner). Not set when only walletClient is used. */
  private _normalizedSigner: ISigner | null = null;

  constructor(config: MyxClientConfig) {
    const mergedConfig: MyxClientConfig = {
      isTestnet: false,
      isBetaMode: false,
      ...config,
    };
    this.validateConfig(mergedConfig);
    this.config = mergedConfig;
    // auth the client if walletClient or signer is provided
    if (this.config.walletClient || this.config.signer) {
      this.auth({
        walletClient: this.config.walletClient,
        signer: this.config.signer,
        getAccessToken: this.config.getAccessToken,
      })
    }
  }

  public clear() {
    this.accessToken = undefined;
    this.accessTokenExpiry = undefined;
    this._normalizedSigner = null;
    this.config = {
      ...this.config,
      signer: undefined,
      walletClient: undefined,
      getAccessToken: undefined,
    };
  }

  /** True if auth was done with signer or walletClient. */
  hasSigner(): boolean {
    return !!(this.config.walletClient || this.config.signer != null || this._normalizedSigner != null);
  }

  /** Returns the signer address for the given chainId. Use when only address is needed. */
  async getSignerAddress(chainId: number): Promise<string> {
    if (this.config.walletClient) {
      const addresses = await this.config.walletClient.getAddresses();
      const addr = addresses[0];
      if (addr) return addr;
    }
    if (this._normalizedSigner) return this._normalizedSigner.getAddress();
    throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
  }

  /** Returns viem WalletClient for the chain (for readContract/writeContract). Use when SDK uses viem. */
  async getViemWalletClient(chainId: number): Promise<WalletClient> {
    if (this.config.walletClient) return this.config.walletClient as WalletClient;
    if (this._normalizedSigner) return await createWalletClientFromSigner(this._normalizedSigner, chainId);
    throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer: call auth({ signer }) or auth({ walletClient })");
  }

  // public async startSeamlessMode(open: boolean) {
  //   this.config = {
  //     ...this.config,
  //     seamlessMode: open,
  //   };

  //   return this.config;
  // }

  // public updateSeamlessWallet({
  //   wallet,
  //   authorized,
  //   masterAddress,
  // }: {
  //   wallet?: Account | null;
  //   authorized?: boolean;
  //   masterAddress?: string;
  // }) {
  //   this.config = {
  //     ...this.config,
  //     seamlessAccount: {
  //       masterAddress: masterAddress ?? "",
  //       wallet: wallet ?? null,
  //       authorized: authorized ?? false,
  //     },
  //   };
  // }

  public updateClientChainId(chainId: number, brokerAddress: string) {
    this.config = {
      ...this.config,
      chainId,
      brokerAddress,
    };
  }

  public auth(params: Pick<MyxClientConfig, "signer" | "walletClient" | "getAccessToken">) {
    // Normalize signer first before clearing, so hasSigner() is never false mid-auth
    const nextNormalizedSigner = params.signer != null ? normalizeSigner(params.signer) : null;
    // Clear only accessToken, keep signer state until new one is ready
    this.accessToken = undefined;
    this.accessTokenExpiry = undefined;
    this.config = {
      ...this.config,
      ...params,
    };
    this._normalizedSigner = nextNormalizedSigner;
    this.validateConfig(this.config);
  }

  private validateConfig(config: MyxClientConfig) {
    const { isTestnet, isBetaMode, chainId } = config;

    /**
     * chainId must be in the range of TESTNET_CHAIN_IDS or MAINNET_CHAIN_IDS
     */

    if (isTestnet) {
      if (!TESTNET_CHAIN_IDS.includes(chainId))
        throw new MyxSDKError(
          MyxErrorCode.InvalidChainId,
          `chainId ${chainId} is not in the range of TESTNET_CHAIN_IDS`
        );
    } else if (isBetaMode) {
      if (!BETA_ENV_CHAIN_IDS.includes(chainId))
        throw new MyxSDKError(
          MyxErrorCode.InvalidChainId,
          `chainId ${chainId} is not in the range of BETA_ENV_CHAIN_IDS`
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
   * Get currently stored accessToken (does not auto-refresh)
   * @returns Promise<string | null> Current accessToken or null
   */
  async getAccessToken(): Promise<string | null> {
    return this.accessToken ?? null;
  }

  /**
   * Manually refresh accessToken (must be called explicitly by the client)
   * @param forceRefresh Whether to force refresh
   * @returns Promise<string | null> Refreshed accessToken or null
   */
  private _getAccessTokenQueue: Array<GetAccessTokenQueueItem> = [];
  private _isGettingAccessToken = false;
  async refreshAccessToken(forceRefresh: boolean = false): Promise<string | null> {
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
      this._refreshAccessToken(item.forceRefresh)
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

  private async _refreshAccessToken(
    forceRefresh: boolean = false
  ): Promise<string | null> {
    // If current token is valid and no force refresh, return it
    if (!forceRefresh && this.isAccessTokenValid()) {
      this._isGettingAccessToken = false;
      return this.accessToken!;
    }

    // If no getAccessToken method provided, return null
    if (!this.config.getAccessToken) {
      sdkWarn("No getAccessToken method provided in config");
      return null;
    }

    try {

      // Call client-provided method to get new token
      const response = (await this.config.getAccessToken()) ?? {
        accessToken: "",
        expireAt: 0,
      };

      if (response && response.accessToken) {
        // expireAt is expiry timestamp; convert to validity in seconds
        let expiryInSeconds = 3600; // Default 1 hour
        if (response.expireAt) {
          const currentTime = Math.floor(Date.now() / 1000); // Current timestamp (seconds)
          expiryInSeconds = response.expireAt - currentTime; // Remaining validity

          // Ensure positive; use default if already expired
          if (expiryInSeconds <= 0) {
            sdkWarn("Received expired token, using default expiry");
            expiryInSeconds = 3600;
          }
        }

        this.setAccessToken(response.accessToken, expiryInSeconds);
        return response.accessToken;
      } else {
        sdkWarn("❌ Received empty accessToken");
        return null;
      }
    } catch (error) {
      sdkError("❌ Failed to refresh accessToken:", error);
      return null;
    }
  }

  /**
   * Set accessToken and expiry
   * @param token accessToken
   * @param expiryInSeconds Token validity in seconds, default 1 hour
   */
  setAccessToken(token: string, expiryInSeconds: number = 3600): void {
    this.accessToken = token;
    this.accessTokenExpiry = Date.now() + expiryInSeconds * 1000;
  }

  /**
   * Get currently stored accessToken (does not trigger refresh)
   * @returns string | undefined Current accessToken
   */
  getCurrentAccessToken(): string | undefined {
    return this.accessToken;
  }

  // /**
  //  * Check if current accessToken is valid
  //  * @returns boolean Whether token is valid
  //  */
  isAccessTokenValid(): boolean {
    return !!this.accessToken;
  }

  /**
   * Clear accessToken
   */
  clearAccessToken(): void {
    this.accessToken = undefined;
    this.accessTokenExpiry = undefined;
  }

  getConfig() {
    return this.config;
  }
}
