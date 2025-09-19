export enum ChainIdEnum {
  LINEA_SEPOLIA = 59141,
  LINEA_MAINNET = 59144,
  ARB_TESTNET = 421614,
  ARB_MAINNET = 42161,
  OPBNB_TESTNET = 5611,
  OPBNB_MAINNET = 204,
  BSC_TESTNET = 97,
  BSC_MAINNET = 56,
}

/**
 * mainnet chain ids
 */

export const MAINNET_CHAIN_IDS = [
  ChainIdEnum.BSC_MAINNET,
  ChainIdEnum.LINEA_MAINNET,
  ChainIdEnum.ARB_MAINNET,
  ChainIdEnum.OPBNB_MAINNET,
  ChainIdEnum.BSC_MAINNET,
] as const;

/**
 * testnet chain ids
 */
export const TESTNET_CHAIN_IDS = [
  ChainIdEnum.LINEA_SEPOLIA,
  ChainIdEnum.ARB_TESTNET,
  ChainIdEnum.OPBNB_TESTNET,
  ChainIdEnum.BSC_TESTNET,
] as const;
