import { SDKConfig, ChainConfig, SDKContextType } from './types.js';
import { defaultSDKConfig } from './default.js';
import { Signer } from 'ethers';

class ConfigManager {
  private config: SDKConfig;
  private currentChainId: number;
  private signer: Signer | null;

  constructor() {
    this.config = defaultSDKConfig;
    this.currentChainId = defaultSDKConfig.defaultChainId;
    this.signer = null;
  }

  init(override?: Partial<SDKConfig>) {
    if (override) {
      const base = this.config;
      this.signer = override.signer || this.signer;
      this.config = {
        ...base,
        ...override,
        chains: override.chains || base.chains,
        defaultChainId: override.defaultChainId || base.defaultChainId,
      };
    }
    this.currentChainId = this.config.defaultChainId;
  }

  setChainId(chainId: number) {
    if (this.config.chains.some(chain => chain.id === chainId)) {
      this.currentChainId = chainId;
    } else {
      console.warn(`Chain ID ${chainId} is not configured.`);
    }
  }

  getChainConfig(chainId?: number): ChainConfig | undefined {
    const targetChainId = chainId || this.currentChainId;
    return this.config.chains.find(chain => chain.id === targetChainId);
  }

  getConfig(): SDKContextType {
    return {
      config: this.config,
      currentChainId: this.currentChainId,
      setChainId: (chainId: number) => this.setChainId(chainId),
      getChainConfig: (chainId?: number) => this.getChainConfig(chainId),
    };
  }
}

export { ConfigManager };

