import { WretchOptions } from "wretch/types";
import { ConfigManager } from "../config/index.js";
import { http } from "@/api/request";
import { merge } from "lodash-es";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";

interface RequestOptions extends WretchOptions {
  auth?: boolean;
}

export class Request {
  protected configManager: ConfigManager;
  constructor(configManager: ConfigManager) {
    this.configManager = configManager;
  }

  protected getHost() {
    const { isTestnet, isBetaMode } = this.configManager.getConfig();
    if (isBetaMode) {
      return "https://api-beta.myx.finance";
    } else if (isTestnet) {
      return "https://api-test.myx.cash";
    } else {
      return "https://api.myx.finance";
    }
  }

  private async buildAuthParams(): Promise<WretchOptions> {
    const config = this.configManager.getConfig();
    if (!this.configManager.hasSigner()) throw new MyxSDKError(MyxErrorCode.InvalidSigner);
    const accessToken = (await this.configManager.getAccessToken()) ?? "";
    const userAddress = await this.configManager.getSignerAddress(config.chainId);
    if (!userAddress) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner);
    }
    return {
      headers: {
        myx_openapi_access_token: accessToken,
        myx_openapi_account: userAddress,
      },
    };
  }

  private buildRequestPath(path: string) {
    if (path.startsWith("http")) {
      return path;
    }
    return this.getHost() + path;
  }

  protected async get<T = Record<string, any>>(
    url: string,
    params: any,
    { auth = false, ...options }: RequestOptions = {}
  ) {
    const authOptions = auth ? await this.buildAuthParams() : {};
    return http.get<T>(
      this.buildRequestPath(url),
      params,
      merge(authOptions, options)
    );
  }

  protected async post<T = Record<string, any>>(
    url: string,
    data: any,
    { auth = false, ...options }: RequestOptions = {}
  ) {
    const authOptions = auth ? await this.buildAuthParams() : {};
    return http.post<T>(
      this.buildRequestPath(url),
      data,
      merge(authOptions, options)
    );
  }

  protected async put<T = Record<string, any>>(
    url: string,
    data: any,
    { auth = false, ...options }: RequestOptions = {}
  ) {
    const authOptions = auth ? await this.buildAuthParams() : {};
    return http.put<T>(
      this.buildRequestPath(url),
      data,
      merge(authOptions, options)
    );
  }

  protected async delete<T = Record<string, any>>(
    url: string,
    { auth = false, ...options }: RequestOptions = {}
  ) {
    const authOptions = auth ? await this.buildAuthParams() : {};
    return http.delete<T>(
      this.buildRequestPath(url),
      merge(authOptions, options)
    );
  }
}
