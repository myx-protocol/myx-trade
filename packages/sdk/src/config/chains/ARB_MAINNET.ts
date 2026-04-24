import { ChainId, ChainInfo } from "@/config/chain.js";
// import ArbitrumLogo from '@/assets/icons/chain/logo/arbitrum.png'
import { GAS_FEE_RESERVED_RATIO } from './../fee.js'

export default {
  chainId: ChainId.ARB_MAINNET,
  chainInfo: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://arb1.arbitrum.io/rpc'],
    label: ' Arbitrum One',
    chainSymbol: 'Arbitrum One',
    explorer: 'https://arbiscan.io/',
    explorerOfTX: 'https://arbiscan.io/tx/',
    logoUrl: '',
    gasPriceRatio: 1.5,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.055 + 0.175) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    gasPrice: 0n
  },
} as ChainInfo

