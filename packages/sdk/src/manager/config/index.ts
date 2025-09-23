import { Signer } from "ethers";
import { MAINNET_CHAIN_IDS, TESTNET_CHAIN_IDS } from "../const";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { LogLevel } from "@/logger";
import { WebSocketConfig } from "@/manager/subscription/websocket/types";
import { AccessTokenResponse } from "@/api/type";

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
  getAccessToken?: () => Promise<string>; // 页面端传入的获取 accessToken 的方法
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
   * 获取 accessToken，如果不存在或已过期则调用页面端方法重新获取
   * @param forceRefresh 是否强制刷新 token
   * @returns Promise<string | null> accessToken 或 null
   */
  async getAccessToken(forceRefresh: boolean = false): Promise<string | null> {
    // 检查是否有获取 token 的方法
    if (!this.config.getAccessToken) {
      return null;
    }

    // 检查当前 token 是否有效
    if (!forceRefresh && this.isAccessTokenValid()) {
      return this.accessToken!;
    }

    try {
      // 调用页面端方法获取新的 token
      const newToken = await this.config.getAccessToken();
      this.setAccessToken(newToken);
      return newToken;
    } catch (error) {
      console.error('Failed to get access token:', error);
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
    this.accessTokenExpiry = Date.now() + (expiryInSeconds * 1000);
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
    if (!this.accessToken || !this.accessTokenExpiry) {
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

  /**
   * 检查是否配置了获取 accessToken 的方法
   * @returns boolean 是否配置了获取方法
   */
  hasAccessTokenMethod(): boolean {
    return typeof this.config.getAccessToken === 'function';
  }

  /**
   * 主动调用获取 accessToken 的方法
   * @param getAccessTokenFn 获取 accessToken 的函数
   * @param args 传递给 getAccessTokenFn 的参数
   * @param expiryInSeconds token 有效期（秒），默认1小时
   * @returns Promise<string | null> 获取到的 accessToken
   */
  async callGetAccessToken(
    getAccessTokenFn: (...args: any[]) => Promise<AccessTokenResponse>, 
    args: any[] = [],
  ): Promise<string | boolean> {
    try {
      console.log('主动调用获取 accessToken / Actively calling getAccessToken...', { args });
      
      // 调用传入的获取函数，传递参数
      const {code, data, msg}: AccessTokenResponse = await getAccessTokenFn(...args);

      if (code === 9200) {
        // 存储新的 token
        this.setAccessToken(data.accessToken, data.expireAt);
        console.log('成功获取并存储 accessToken / Successfully obtained and stored accessToken');
        return data.accessToken;
      } else {
        console.warn('获取到的 accessToken 为空 / Obtained accessToken is empty');
        return false;
      }
    } catch (error) {
      console.error('主动获取 accessToken 失败 / Failed to actively get accessToken:', error);
      return false;
    }
  }

  getConfig() {
    return this.config;
  }
}
