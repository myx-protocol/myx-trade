import { ChainConfig } from './types.js';

export const arbitrumSepolia: ChainConfig = {
  id: 421614,
  name: 'Arbitrum Sepolia',
  rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
  blockExplorers: ['https://sepolia.arbiscan.io'],
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
};

export const bscTestnet: ChainConfig = {
  id: 97,
  name: 'BNB Chain Testnet',
  rpcUrls: ['https://bsc-testnet-dataseed.bnbchain.org'],
  blockExplorers: ['https://testnet.bscscan.com'],
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
};

export const defaultChains: ChainConfig[] = [arbitrumSepolia, bscTestnet];

export function getChainInfo(chainId: number): ChainConfig | undefined {
  return defaultChains.find(chain => chain.id === chainId);
}
