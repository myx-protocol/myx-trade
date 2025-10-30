import {
  BrowserProvider,
  Contract,
  Eip1193Provider,
  ethers,
  JsonRpcProvider,
  JsonRpcSigner,
  Signer,
  ZeroAddress
} from "ethers";
import { Address } from "@/address";
import { ChainId } from "@/config/chain";
import { getChainInfo } from "@/config/chains/index";
import { RotationProvider } from "@/web3/rotationProvider";
import pkg from '../../package.json'
import { ConfigManager } from "@/manager/config";

export function getContract(
  address: string,
  ABI: any,
  provider: JsonRpcProvider | JsonRpcSigner | Signer,
): Contract {
  if (Address.from(address).isEqualTo(ZeroAddress)) {
    throw new Error(`Invalid 'address' parameter '${address}'.`);
  }
  
  return new Contract(address, ABI, provider as any);
}

export const getJSONProvider = (chainId: ChainId): JsonRpcProvider => {
  const chainConfig = getChainInfo(chainId);
  const chainProviders: string[] = [];
  if (chainConfig.privateJsonRPCUrl) {
    chainProviders.push(chainConfig.privateJsonRPCUrl);
  }
  if (chainConfig.publicJsonRPCUrl.length > 0) {
    chainConfig.publicJsonRPCUrl.map((rpc) => chainProviders.push(rpc));
  }
  if (chainProviders.length === 0) {
    throw new Error(`${chainId} has no jsonRPCUrl configured`);
  }
  if (chainProviders.length === 1) {
    return new JsonRpcProvider(chainProviders[0], chainId, {
      staticNetwork: true,
    });
  } else {
    // 将RotationProvider转换为JsonRpcProvider类型
    return new RotationProvider(chainProviders, chainId) as unknown as JsonRpcProvider;
  }
};

export class MxSDK {
  version = pkg.version;
  public provider: BrowserProvider | undefined;
  private configManager: ConfigManager | undefined;
  private static _instance: MxSDK
  
  
  constructor() {
    console.log(this.version);
  }
  
  public setConfigManager(configManager: ConfigManager): void {
    this.configManager = configManager;
  }
  public getConfigManager(): ConfigManager | undefined {
    return this.configManager;
  }
  
  public setProvider(provider: BrowserProvider) {
    this.provider = provider;
  }
  public getProvider() {
    return  this.provider
  }
  static getInstance() {
    if (!this._instance) {
      // this._instance?.close()
      this._instance = new MxSDK()
      // this.chainId = chainId
    }
    return this._instance
  }
}

const sdk = MxSDK.getInstance()

if (typeof window !== "undefined") {
  (window as any).MxSDK = sdk;
} else if (typeof globalThis !== "undefined") {
  (globalThis as any).MxSDK = sdk;
}

export default sdk;
// 测试用
export const getWalletProvider = async (chainId: ChainId) => {
  try {
    // 检查是否有钱包连接
    // if (!window?.ethereum) {
    //   console.log("No wallet installed; using read-only defaults")
    //   return ethers.getDefaultProvider("mainnet") as BrowserProvider
    // }

    // 创建 ethers provider
    const provider = sdk.provider
    if (!provider) {
      throw new Error('Provider missing in provider');
    }
    
    /*if (provider) {
      provider.on("disconnect", (error: any) => {
        console.log("Wallet disconnected:", error);
        // Suggest full reload or attempt reconnect
        window.location.reload();
      });
      
      provider.on("connect", (info: any) => {
        console.log("Wallet connected:", info);
      });
    }*/

    // 如果指定了 chainId，可以验证当前链是否匹配
    if (chainId) {
      const network = await provider.getNetwork()
      console.log(provider)
      console.log(`Connected to chain: ${network.chainId}, requested: ${chainId}`)
      if(Number(network.chainId) !== chainId) {
        await provider.send("wallet_switchEthereumChain", [{ chainId: BigInt(chainId) }]);
      }
    }

    return provider
  } catch (error) {
    console.error("Error getting wallet provider:", error)
    // 如果获取失败，返回默认的只读 provider
    return ethers.getDefaultProvider("mainnet") as BrowserProvider
  }
};

export const getSignerProvider = async (chainId: ChainId) => {
  const provider = await getWalletProvider (chainId);
  console.log(provider)
  return provider?.getSigner?.();
};
