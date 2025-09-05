export const ChainId = {
  ARB_TESTNET: 421614,
  ARB_MAINNET: 42161,
} as const;

export type ChainId = typeof ChainId[keyof typeof ChainId];