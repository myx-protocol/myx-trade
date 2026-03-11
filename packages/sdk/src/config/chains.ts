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

export const defaultChains: ChainConfig[] = [arbitrumSepolia];

export function getChainInfo(chainId: number): ChainConfig | undefined {
  return defaultChains.find(chain => chain.id === chainId);
}
