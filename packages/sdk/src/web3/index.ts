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
import { getMarketList, MarketInfo } from "@/api";

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
    // Cast RotationProvider to JsonRpcProvider type
    return new RotationProvider(chainProviders, chainId) as unknown as JsonRpcProvider;
  }
};

export class MxSDK {
  version = pkg.version;
  public provider: BrowserProvider | undefined;
  #configManager?: ConfigManager
  private static _instance: MxSDK
  public Markets: MarketInfo[] | undefined
  
  constructor() {
    console.log(this.version);
  }
  
  setConfigManager(cm: ConfigManager) {
    this.#configManager = cm
  }
  getConfigManager(): ConfigManager | undefined {
    return this.#configManager;
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
  public async getMarkets () {
    try {
      const result = await getMarketList()
      const data  = result?.data || []
      this.Markets = data
      return data
    } catch (error) {
      throw error;
    }
  }
}

const sdk = MxSDK.getInstance()

if (typeof window !== "undefined") {
  (window as any).MxSDK = sdk;
} else if (typeof globalThis !== "undefined") {
  (globalThis as any).MxSDK = sdk;
}

export default sdk;
// For testing only
export const getWalletProvider = async (chainId: ChainId) => {
  try {
    // Check if a wallet is connected
    // if (!window?.ethereum) {
    //   console.log("No wallet installed; using read-only defaults")
    //   return ethers.getDefaultProvider("mainnet") as BrowserProvider
    // }

    // Create ethers provider
    const walletClient  = sdk.getConfigManager()?.getConfig()?.walletClient
    const provider = new BrowserProvider(walletClient?.transport!);
    if (!provider) {
      throw new Error('missing provider');
    }

    // If chainId is specified, validate that the current chain matches
    // if (chainId) {
    //   const network = await provider.getNetwork()
    //   console.log(provider)
    //   console.log(`Connected to chain: ${network.chainId}, requested: ${chainId}`)
    //   if(Number(network.chainId) !== chainId) {
    //     await provider.send("wallet_switchEthereumChain", [{ chainId: BigInt(chainId) }]);
    //   }
    // }

    return provider
  } catch (error) {
    console.error("Error getting wallet provider:", error)
    // If fetching fails, return a default read-only provider
    return ethers.getDefaultProvider("mainnet") as BrowserProvider
  }
};

export const getSignerProvider = async (chainId: ChainId) => {
  const provider = await getWalletProvider (chainId);
  // console.log(provider)
  return provider?.getSigner?.();
};
