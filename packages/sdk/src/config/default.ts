import { SDKConfig } from './types';
import { defaultChains, arbitrumSepolia } from './chains';

export const defaultSDKConfig: SDKConfig = {
  chains: defaultChains,
  defaultChainId: arbitrumSepolia.id,
  language: 'en',
  debug: false,
};
