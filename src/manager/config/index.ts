import { Signer } from "ethers";

export interface MyxClientConfig {
  chainId: number;
  signer: Signer;
  brokerAddress: string;
  isTestnet?: boolean;
  poolingInterval?: number;
  seamlessMode?: boolean;
  seamlessKeyPath?: string;
  seamlessKeyPassword?: string;
}

export class ConfigManager {
  private config: MyxClientConfig | undefined;
  private constructor() {}

  static privateInstance: ConfigManager | null = null;

  static getInstance() {
    if (!ConfigManager.privateInstance) {
      ConfigManager.privateInstance = new ConfigManager();
    }
    return ConfigManager.privateInstance;
  }

  setConfig(config: MyxClientConfig) {
    this.config = config;
  }

  getConfig() {
    return this.config;
  }
  
}

