import { ChainId, ChainInfo } from "@/config/chain.js";
// import ArbitrumLogo from '@/assets/icons/chain/logo/arbitrum.png'
import { GAS_FEE_RESERVED_RATIO } from './../fee.js'

export default {
  chainId: ChainId.ARB_TESTNET,
  chainInfo: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: [
      'https://sepolia-rollup.arbitrum.io/rpc',
      // 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
    ],
    label: ' Arbitrum Sepolia',
    chainSymbol: 'Arb Sepolia',
    explorer: 'https://sepolia.arbiscan.io/',
    explorerOfTX: 'https://sepolia.arbiscan.io/tx/',
    faucetUrl: 'https://bwarelabs.com/faucets/arbitrum-sepolia',
    logoUrl: '',
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
} as ChainInfo
