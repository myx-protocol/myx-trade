import { MyxClient, MyxClientConfig } from "../index.js";
import { MyxErrorCode, MyxSDKError } from "../error/const.js";
import { getBrokerContract } from "@/web3/providers";
import { getContractAddressByChainId } from "@/config/address";
import { isSupportedChainFn } from "@/config/chain";

export class BaseMyxClient {
  protected client: MyxClient;
  constructor(client: MyxClient) {
    this.client = client;
  }

  protected getConfig(): MyxClientConfig {
    return this.client.getConfigManager()?.getConfig();
  }

  protected getAddressConfig() {
    const config = this.getConfig();
    const chainId = config?.chainId;
    if (!chainId || !isSupportedChainFn(chainId)) {
      throw new MyxSDKError(MyxErrorCode.InvalidChainId, "Invalid chain id");
    }
    return getContractAddressByChainId(chainId);
  }

  protected getBrokerContract() {
    const config = this.getConfig();
    if (!config?.brokerAddress) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidBrokerAddress,
        "Invalid broker address"
      );
    }
    return getBrokerContract(config.chainId, config.brokerAddress);
  }

  protected get config() {
    return this.getConfig();
  }
}
