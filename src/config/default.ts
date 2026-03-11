import { SDKConfig } from './types.js';
import { defaultChains, arbitrumSepolia } from './chains.js';

export const defaultSDKConfig: Partial<SDKConfig> = {
  chains: defaultChains,
  defaultChainId: arbitrumSepolia.id,
  language: 'en',
  debug: false,
};
