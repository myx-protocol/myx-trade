import { ChainId } from "./chain.js"

// Reserved gas fee ratio (10x gas)
export const GAS_FEE_RESERVED_RATIO = 10

// Forwarder contract pledge fee ratio (2x)
export const FORWARD_PLEDGE_FEE_RADIO = 2


export const SEAMLESS_ACCOUNT_GAS_LIMIT = 5000000

export const TRADE_GAS_LIMIT_RATIO: Record<ChainId, bigint> = {
  [ChainId.ARB_MAINNET]: 130n,
  [ChainId.ARB_TESTNET]: 130n,
  [ChainId.LINEA_MAINNET]: 130n,
  [ChainId.LINEA_SEPOLIA]: 130n,
  [ChainId.BSC_MAINNET]: 150n,
  [ChainId.BSC_TESTNET]: 150n,
}