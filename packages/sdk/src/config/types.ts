import { Signer } from "ethers";

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrls: string[];
  blockExplorers: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface SDKConfig {
  chains: ChainConfig[];
  defaultChainId: number;
  signer: Signer | null;
  language: 'en' | 'zh' | 'ja' | 'ko';
  debug?: boolean;
}

export interface SDKContextType {
  config: SDKConfig;
  currentChainId: number;
  setChainId: (chainId: number) => void;
  getChainConfig: (chainId?: number) => ChainConfig | undefined;
}
