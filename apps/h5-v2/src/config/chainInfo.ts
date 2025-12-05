import { t } from '@lingui/core/macro'
import ArbitrumLogo from '@/assets/icon/commons/chain/logo/arbitrum.svg'
import OpbnbLogo from '@/assets/icon/commons/chain/logo/bnb.svg'
import LineaLogo from '@/assets/icon/commons/chain/logo/linea.svg'

import { ChainId } from './chain'
import { GAS_FEE_RESERVED_RATIO } from './fee'

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
  readonly usdAddress: string
}

export type ChainInfoMap = { readonly [chainId: number]: BaseChainInfo }

export const CHAIN_INFO: ChainInfoMap = {
  [ChainId.LINEA_SEPOLIA]: {
    explorer: 'https://sepolia.lineascan.build/',
    explorerOfTX: 'https://sepolia.lineascan.build/tx/',
    publicJsonRPCUrl: [
      'https://rpc.sepolia.linea.build',
      'https://linea-sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    ],
    label: 'Linea Sepolia',
    logoUrl: LineaLogo,
    faucetUrl: '',
    chainSymbol: 'Linea',
    gasFeeReservedForCollateral: (0.525 + 1) * GAS_FEE_RESERVED_RATIO,
    gasPriceRatio: 1.3,
    gasLimitRatio: 1.2,
    gasAmountRatio: 2,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    usdAddress: '',
  },
  [ChainId.LINEA_MAINNET]: {
    label: 'Linea Mainnet',
    explorer: 'https://lineascan.build/',
    logoUrl: LineaLogo,
    explorerOfTX: 'https://lineascan.build/tx/',
    publicJsonRPCUrl: [
      'https://rpc.linea.build/',
      'https://1rpc.io/linea',
      'https://rpc.linea.build',
    ],
    chainSymbol: 'Linea',
    gasPriceRatio: 1.3,
    gasLimitRatio: 1.2,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.525 + 0.35) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    usdAddress: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
  },
  [ChainId.ARB_TESTNET]: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://sepolia-rollup.arbitrum.io/rpc'],
    label: ' Arbitrum Sepolia',
    chainSymbol: 'Arb Sepolia',
    explorer: 'https://sepolia.arbiscan.io/',
    explorerOfTX: 'https://sepolia.arbiscan.io/tx/',
    faucetUrl: 'https://bwarelabs.com/faucets/arbitrum-sepolia',
    logoUrl: ArbitrumLogo,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.055 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    usdAddress: '',
  },
  [ChainId.ARB_MAINNET]: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://arb1.arbitrum.io/rpc'],
    label: ' Arbitrum One',
    chainSymbol: 'Arbitrum One',
    explorer: 'https://arbiscan.io/',
    explorerOfTX: 'https://arbiscan.io/tx/',
    logoUrl: ArbitrumLogo,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.055 + 0.175) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    usdAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', //
  },

  [ChainId.BSC_TESTNET]: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://bsc-testnet-dataseed.bnbchain.org'],
    label: 'BNB Chain Testnet',
    chainSymbol: 'BNB Chain Testnet',
    explorer: 'https://testnet.bscscan.com/',
    explorerOfTX: 'https://testnet.bscscan.com/tx/',
    faucetUrl: 'https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/',
    logoUrl: OpbnbLogo,
    gasPriceRatio: 1,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.0005 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    usdAddress: '',
  },
  [ChainId.BSC_MAINNET]: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://bsc-dataseed.bnbchain.org'],
    label: 'BNB Chain',
    chainSymbol: 'BNB Chain',
    explorer: 'https://bscscan.com/',
    explorerOfTX: 'https://bscscan.com/tx/',
    faucetUrl: 'https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/',
    logoUrl: OpbnbLogo,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.0005 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    usdAddress: '0x55d398326f99059fF775485246999027B3197955',
  },
}

export function getChainInfo(chainId: ChainId) {
  const chainInfo = CHAIN_INFO[chainId]

  if (!chainInfo) {
    throw new Error(t`Could not find information with chain id ${chainId}`)
  }

  return chainInfo
}
