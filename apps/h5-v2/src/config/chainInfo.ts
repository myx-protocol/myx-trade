import { t } from '@lingui/core/macro'
import ArbitrumLogo from '@/assets/icon/commons/chain/logo/arbitrum.png'
import OpbnbLogo from '@/assets/icon/commons/chain/logo/opbnb.png'
import LineaLogo from '@/assets/icon/commons/chain/logo/linea.png'

import { ScrollMainnet } from './chains/ScrollMainnet'
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
}

export type ChainInfoMap = { readonly [chainId: number]: BaseChainInfo }

export const CHAIN_INFO: ChainInfoMap = {
  [ChainId.MYX_DEV]: {
    label: 'MYX Dev',
    explorer: 'http://export.myx.cash/',
    chainSymbol: 'MYX Dev',
    privateJsonRPCUrl: 'https://dev-rpc.myx.cash',
    publicJsonRPCUrl: ['https://dev-rpc.myx.cash'],
    explorerOfTX: 'http://export.myx.cash/tx/',
    faucetUrl: '',
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasFeeReservedForCollateral: (0 + 0) * GAS_FEE_RESERVED_RATIO,
    gasAmountRatio: 2,
    nativeCurrency: {
      name: 'MYX Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
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
  },
  [ChainId.SCROLL_MAINNET]: ScrollMainnet.chainInfo,

  [ChainId.OPBNB_TESTNET]: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://opbnb-testnet-rpc.bnbchain.org'],
    label: ' opBNB Testnet',
    chainSymbol: 'opBNB Testnet',
    explorer: 'https://testnet.opbnbscan.com/',
    explorerOfTX: 'https://testnet.opbnbscan.com/tx/',
    faucetUrl: 'https://docs.bnbchain.org/bnb-smart-chain/developers/faucet/',
    logoUrl: OpbnbLogo,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.0005 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Test BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [ChainId.OPBNB_MAINNET]: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://opbnb-mainnet-rpc.bnbchain.org'],
    label: 'opBNB Mainnet',
    chainSymbol: 'opBNB Mainnet',
    explorer: 'https://opbnbscan.com/',
    explorerOfTX: 'https://opbnbscan.com/tx/',
    logoUrl: OpbnbLogo,
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.0005 + 0.175) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
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
  },
}

export function getChainInfo(chainId: ChainId) {
  const chainInfo = CHAIN_INFO[chainId]

  return chainInfo || null
}
