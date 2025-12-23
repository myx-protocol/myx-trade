import { Contract, Signer } from "ethers";
import { MyxClient, MyxClientConfig } from "..";
import { MyxErrorCode, MyxSDKError } from "../error/const";

export class BaseMyxClient {
  protected client: MyxClient;
  constructor(client: MyxClient) {
    this.client = client;
  }

  protected getConfig(): MyxClientConfig {
    return this.client.getConfigManager()?.getConfig();
  }

  protected async getSigner() {
    const config = this.getConfig();
    if (!config?.signer) {
      throw new MyxSDKError(MyxErrorCode.InvalidSigner, "Invalid signer");
    }
    return config.signer as Signer;
  }

  protected async connectContract<T extends Record<string, any>>(
    contract: T
  ): Promise<T> {
    return contract.connect(await this.getSigner()) as T;
  }
}
