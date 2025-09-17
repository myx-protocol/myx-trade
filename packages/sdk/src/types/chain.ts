/**
 * Chain and network related types
 */

import { ChainId, Address } from './common';

// Supported chain IDs
export const SupportedChainId = {
  // Arbitrum
  ARBITRUM_MAINNET: 42161,
  ARBITRUM_SEPOLIA: 421614,
  
  // BSC
  BSC_MAINNET: 56,
  BSC_TESTNET: 97,
  
  // Ethereum
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
  
  // Polygon
  POLYGON_MAINNET: 137,
  POLYGON_MUMBAI: 80001,
} as const;
export type SupportedChainId = typeof SupportedChainId[keyof typeof SupportedChainId];

// Chain configuration
export interface ChainConfig {
  id: ChainId;
  name: string;
  shortName: string;
  network: string;
  rpcUrls: string[];
  blockExplorers: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  testnet: boolean;
}

// Token information for specific chain
export interface ChainToken {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI?: string;
  coingeckoId?: string;
}

// Contract addresses for specific chain
export interface ChainContracts {
  multicall?: Address;
  router?: Address;
  factory?: Address;
  broker?: Address;
  liquidityRouter?: Address;
  oracle?: Address;
  feeCollector?: Address;
}

// Chain-specific configuration
export interface ChainSpecificConfig {
  chainId: ChainId;
  contracts: ChainContracts;
  tokens: Record<string, ChainToken>;
  gasSettings: {
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    gasLimit?: string;
  };
  blockTime: number; // Average block time in seconds
  confirmations: number; // Required confirmations
}

// Network status
export const NetworkStatus = {
  CONNECTED: 'connected',
  CONNECTING: 'connecting',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
} as const;
export type NetworkStatus = typeof NetworkStatus[keyof typeof NetworkStatus];

// Network provider information
export interface NetworkProvider {
  chainId: ChainId;
  status: NetworkStatus;
  rpcUrl: string;
  blockNumber?: number;
  gasPrice?: string;
  lastUpdated: number;
}

// Chain switch request
export interface ChainSwitchRequest {
  targetChainId: ChainId;
  currentChainId?: ChainId;
  autoSwitch?: boolean;
}

// Chain metadata
export interface ChainMetadata {
  chainId: ChainId;
  name: string;
  logoURI?: string;
  explorers: {
    name: string;
    url: string;
    standard: string;
  }[];
  faucets?: string[];
  infoURL?: string;
}

// Multi-chain operation
export interface MultiChainOperation<T = any> {
  chainId: ChainId;
  operation: string;
  params: T;
  status: 'pending' | 'success' | 'failed';
  result?: any;
  error?: string;
}

// Cross-chain bridge information
export interface BridgeInfo {
  sourceChain: ChainId;
  targetChain: ChainId;
  token: Address;
  bridgeContract: Address;
  fee: string;
  estimatedTime: number; // in seconds
}

// Gas price tier
export const GasPriceTier = {
  SLOW: 'slow',
  STANDARD: 'standard',
  FAST: 'fast'
} as const;
export type GasPriceTier = typeof GasPriceTier[keyof typeof GasPriceTier];

// Gas price recommendation
export interface GasPriceRecommendation {
  [GasPriceTier.SLOW]: {
    gasPrice: string;
    estimatedTime: number;
  };
  [GasPriceTier.STANDARD]: {
    gasPrice: string;
    estimatedTime: number;
  };
  [GasPriceTier.FAST]: {
    gasPrice: string;
    estimatedTime: number;
  };
}
