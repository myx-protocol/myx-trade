import { ZeroAddress } from "ethers";
export type Address = `0x${string}` | typeof ZeroAddress

export enum ChainId {
  LINEA_SEPOLIA = 59141,
  LINEA_MAINNET = 59144,
  ARB_TESTNET = 421614,
  ARB_MAINNET = 42161,
  OPBNB_TESTNET = 5611,
  OPBNB_MAINNET = 204,
  SCROLL_MAINNET = 534352,
  BSC_TESTNET = 97,
  BSC_MAINNET = 56,
}

export const MAINNET_CHAIN_IDS = [
  ChainId.BSC_MAINNET,
  ChainId.LINEA_MAINNET,
  ChainId.ARB_MAINNET,
  ChainId.SCROLL_MAINNET,
  ChainId.OPBNB_MAINNET,
] as const

export const PROD_ENV_CHAIN_IDS = [
  ChainId.BSC_MAINNET,
  ChainId.LINEA_MAINNET,
  ChainId.ARB_MAINNET,
] as const
export type SupportedProdEnvChainId = [typeof PROD_ENV_CHAIN_IDS][number]

export const BETA_ENV_CHAIN_IDS = [ChainId.LINEA_SEPOLIA, ChainId.ARB_TESTNET] as const
export type SupportedBetaEnvChainId = [typeof BETA_ENV_CHAIN_IDS][number]

export const TEST_ENV_CHAIN_IDS = [
  ChainId.LINEA_SEPOLIA,
  ChainId.ARB_TESTNET,
  // ChainId.OPBNB_TESTNET,
  ChainId.BSC_TESTNET,
] as const
export type SupportedTestEnvChainId = [typeof TEST_ENV_CHAIN_IDS][number]

export const OKX_BRIDGE_CHAIN_IDS = [ChainId.LINEA_MAINNET, ChainId.ARB_MAINNET] as const


export const DEV_ENV_CHAIN_IDS = [
  ChainId.LINEA_SEPOLIA,
  ChainId.ARB_TESTNET,
  ChainId.OPBNB_TESTNET,
  ChainId.BSC_TESTNET,
] as const
export type SupportedDevEnvChainId = [typeof DEV_ENV_CHAIN_IDS][number]

export const SupportedChainIds = [ChainId.ARB_TESTNET]
// export function getSupportedChainIdsByEnv(): readonly [ChainId, ...ChainId[]] {
//   if (isTestMode()) {
//     return TEST_ENV_CHAIN_IDS
//   } else if (isProdMode()) {
//     return PROD_ENV_CHAIN_IDS
//   } else if (isBetaMode()) {
//     return BETA_ENV_CHAIN_IDS
//   } else {
//     return TEST_ENV_CHAIN_IDS
//     // throw new Error('Unsupported environment, unable to obtain `SupportedChainIds`')
//   }
// }

// export function getAsSupportedChainIdFn(chainId?: number | null | ChainId) {
//   const supportedChainIds = getSupportedChainIdsByEnv()
//   const { VITE_GLOB_CHAIN_ID } = getAppEnvConfig()

//   return isSupportedChainFn(chainId)
//     ? chainId
//     : isSupportedChainFn(VITE_GLOB_CHAIN_ID)
//       ? VITE_GLOB_CHAIN_ID
//       : supportedChainIds[0]
// }

export function isSupportedChainFn(chainId?: number | null | ChainId): chainId is ChainId {
  return !!chainId && SupportedChainIds.includes(chainId)
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

export interface BaseChainInfo {
  readonly explorer: string
  readonly explorerOfTX: string
  readonly label: string
  readonly logoUrl?: string
  readonly faucetUrl?: string
  readonly chainSymbol?: string
  readonly gasPriceApiUrl?: string
  readonly gasPriceRatio: number
  readonly gasLimitRatio: number
  readonly gasAmountRatio: number
  /** (forward fee + network fee) * GAS_FEE_RESERVED_RATIO */
  readonly gasFeeReservedForCollateral: number
  /** private rpc will be used for rpc queries inside the client. normally has private api key and better rate */
  privateJsonRPCUrl?: string
  /** public rpc used if not private found */
  publicJsonRPCUrl: readonly string[]
  readonly nativeCurrency: {
    name: string // e.g. 'Goerli ETH',
    symbol: string // e.g. 'gorETH',
    decimals: number // e.g. 18,
  }
}

export interface RpcRetryOption {
  n: number
  minWait: number
  maxWait: number
}

export interface ContractAddress {
  readonly USDC:Address,
  readonly POOL_MANAGER:Address,
  readonly POOL_VIEW:Address,
  readonly HYPER_VAULT:Address,
  readonly FEE_COLLECTOR:Address,
  readonly POSITION_MANAGER:Address,
  readonly ORDER_MANAGER:Address,
  readonly TRUSTED_FORWARDER:Address,
  readonly FRONT_FACET:Address, // router address
  readonly DELEGATE_FACET:Address, // Seamless router address
  readonly FAUCET:Address,
  readonly UI_POOL_DATA_PROVIDER:Address,
  readonly UI_POSITION_DATA_PROVIDER:Address,
  readonly PYTH:Address,
  readonly MYX:Address,
  readonly ERC20:Address,
  readonly LIQUIDITY_ROUTER:Address,
  readonly BASE_POOL:Address,
  readonly QUOTE_POOL:Address,
  readonly BROKER:Address,
}

export interface ChainInfo {
  chainId: ChainId,
  chainInfo: BaseChainInfo,
}

