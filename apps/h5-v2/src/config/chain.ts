import { isBetaMode, isDevMode, isProdMode, isTestMode } from '@/utils/env'
import { ScrollMainnet } from './chains/ScrollMainnet'

export enum ChainId {
  MYX_DEV = 131338,
  LINEA_SEPOLIA = 59141,
  LINEA_MAINNET = 59144,
  ARB_TESTNET = 421614,
  ARB_MAINNET = 42161,
  OPBNB_TESTNET = 5611,
  OPBNB_MAINNET = 204,
  SCROLL_MAINNET = ScrollMainnet.chainId,
  BSC_TESTNET = 97,
  BSC_MAINNET = 56,
}

export const MAINNET_CHAIN_IDS = [
  ChainId.LINEA_MAINNET,
  ChainId.ARB_MAINNET,
  ChainId.SCROLL_MAINNET,
  ChainId.OPBNB_MAINNET,
  ChainId.BSC_MAINNET,
] as const

export const PROD_ENV_CHAIN_IDS = [
  ChainId.BSC_MAINNET,
  ChainId.LINEA_MAINNET,
  ChainId.ARB_MAINNET,
  ChainId.OPBNB_MAINNET,
] as const
export type SupportedProdEnvChainId = [typeof PROD_ENV_CHAIN_IDS][number]

export const BETA_ENV_CHAIN_IDS = [ChainId.LINEA_SEPOLIA, ChainId.ARB_TESTNET] as const
export type SupportedBetaEnvChainId = [typeof BETA_ENV_CHAIN_IDS][number]

export const TEST_ENV_CHAIN_IDS = [
  // ChainId.LINEA_SEPOLIA,
  ChainId.ARB_TESTNET,
  // ChainId.OPBNB_TESTNET,
  // ChainId.BSC_TESTNET,
] as const
export type SupportedTestEnvChainId = [typeof TEST_ENV_CHAIN_IDS][number]

export const OKX_BRIDGE_CHAIN_IDS = [ChainId.LINEA_MAINNET, ChainId.ARB_MAINNET] as const

export const DEV_ENV_CHAIN_IDS = [
  // ChainId.LINEA_SEPOLIA,
  ChainId.ARB_TESTNET,
  // ChainId.OPBNB_TESTNET,
  // ChainId.BSC_TESTNET,
] as const
export type SupportedDevEnvChainId = [typeof DEV_ENV_CHAIN_IDS][number]

export function getSupportedChainIdsByEnv(): readonly [ChainId, ...ChainId[]] {
  if (isDevMode()) {
    return DEV_ENV_CHAIN_IDS
  } else if (isTestMode()) {
    return TEST_ENV_CHAIN_IDS
  } else if (isProdMode()) {
    return PROD_ENV_CHAIN_IDS
  } else if (isBetaMode()) {
    return BETA_ENV_CHAIN_IDS
  } else {
    throw new Error('Unsupported environment, unable to obtain `SupportedChainIds`')
  }
}

export function getAsSupportedChainIdFn(chainId?: number | null | ChainId) {
  const supportedChainIds = getSupportedChainIdsByEnv()
  const VITE_GLOB_CHAIN_ID = import.meta.env.VITE_GLOB_CHAIN_ID

  return isSupportedChainFn(chainId)
    ? chainId
    : isSupportedChainFn(VITE_GLOB_CHAIN_ID)
      ? VITE_GLOB_CHAIN_ID
      : supportedChainIds[0]
}

export function isSupportedChainFn(chainId?: number | null | ChainId): chainId is ChainId {
  const supportedChainIds = getSupportedChainIdsByEnv()
  return !!chainId && supportedChainIds.includes(chainId)
}

export function isSupportedSeamlessAccountChain(chainId?: number | null | ChainId) {
  return (
    !!chainId &&
    [
      ChainId.LINEA_SEPOLIA,
      ChainId.ARB_TESTNET,
      ChainId.OPBNB_TESTNET,
      ChainId.ARB_MAINNET,
      ChainId.LINEA_MAINNET,
      ChainId.OPBNB_MAINNET,
      ChainId.BSC_TESTNET,
      ChainId.BSC_MAINNET,
    ].includes(chainId)
  )
}
