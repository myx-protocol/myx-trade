import { Contract, Signer } from "ethers";
import { MyxClient, MyxClientConfig } from "..";
import { MyxErrorCode, MyxSDKError } from "../error/const";
import { getBrokerContract } from "@/web3/providers";
import address from "@/config/address";
import { ContractAddress, isSupportedChainFn } from "@/config/chain";

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

  protected getAddressConfig() {
    const config = this.getConfig();
    const chainId = config?.chainId;
    if (!chainId || isSupportedChainFn(chainId)) {
      throw new MyxSDKError(MyxErrorCode.InvalidChainId, "Invalid chain id");
    }
    return address[chainId as keyof typeof address] as ContractAddress;
  }

  protected async connectContract<T extends Record<string, any>>(
    contract: T
  ): Promise<T> {
    return contract.connect(await this.getSigner()) as T;
  }

  protected async getBrokerContract() {
    const config = this.getConfig();
    if (!config?.brokerAddress) {
      throw new MyxSDKError(
        MyxErrorCode.InvalidBrokerAddress,
        "Invalid broker address"
      );
    }
    return getBrokerContract(config.chainId, config.brokerAddress);
  }
}
