/** Minimal signer shape (ethers Signer / viem WalletClient / ISigner compatible). */
export interface MinimalSigner {
  getAddress(): Promise<string>;
}

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
  signer: MinimalSigner | null;
  language: 'en' | 'zh' | 'ja' | 'ko';
  debug?: boolean;
}

export interface SDKContextType {
  config: SDKConfig;
  currentChainId: number;
  setChainId: (chainId: number) => void;
  getChainConfig: (chainId?: number) => ChainConfig | undefined;
}
