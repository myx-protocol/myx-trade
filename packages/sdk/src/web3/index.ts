import { ConfigManager } from "@/manager/config/index.js";
import { getMarketList, MarketInfo } from "@/api/index.js";
import type { WalletClient } from "viem";

export class MxSDK {
  version = __SDK_VERSION__;
  /** @deprecated Prefer getWalletClient(chainId) for viem-based flows. */
  public provider: unknown;
  #configManager?: ConfigManager;
  private static _instance: MxSDK;
  public Markets: MarketInfo[] | undefined;

  constructor() {
    // Version log: host can setSdkLogSink(console) to see this
  }

  setConfigManager(cm: ConfigManager) {
    this.#configManager = cm;
  }
  getConfigManager(): ConfigManager | undefined {
    return this.#configManager;
  }

  /** @deprecated Use getWalletClient(chainId) instead. */
  public setProvider(provider: unknown) {
    this.provider = provider;
  }
  public getProvider() {
    return this.provider;
  }
  static getInstance() {
    if (!this._instance) {
      this._instance = new MxSDK();
    }
    return this._instance;
  }
  public async getMarkets() {
    try {
      const result = await getMarketList();
      const data = result?.data || [];
      this.Markets = data;
      return data;
    } catch (error) {
      throw error;
    }
  }
}

const sdk = MxSDK.getInstance();

export default sdk;

/** Returns viem WalletClient for the chain. Prefer this over ethers BrowserProvider. */
export const getWalletProvider = async (chainId: number): Promise<WalletClient> => {
  const cm = sdk.getConfigManager();
  if (!cm?.hasSigner()) throw new Error("No signer: call auth({ signer }) or auth({ walletClient })");
  return cm.getViemWalletClient(chainId);
};

export { getPublicClient, getWalletClient, setConfigManagerForViem, getConfigManagerForViem } from "./viemClients.js";
