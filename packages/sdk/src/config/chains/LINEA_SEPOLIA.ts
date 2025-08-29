import { ChainId, ChainInfo } from "@/config/chain";
import LineaLogo from '@/assets/icons/chain/logo/linea.png'
import { GAS_FEE_RESERVED_RATIO } from './../fee'

export default {
  chainId: ChainId.LINEA_SEPOLIA,
  chainInfo: {
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
    gasPriceRatio: 1.3,
    gasLimitRatio: 1.2,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0.525 + 1) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
} as ChainInfo
