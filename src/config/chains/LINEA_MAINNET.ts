import { ChainId, ChainInfo } from "@/config/chain";
import LineaLogo from '@/assets/icons/chain/logo/linea.png'
import { GAS_FEE_RESERVED_RATIO } from './../fee'

export default  {
  chainId: ChainId.LINEA_MAINNET,
  chainInfo: {
    label: 'Linea Mainnet',
    explorer: 'https://lineascan.build/',
    logoUrl: LineaLogo,
    explorerOfTX: 'https://lineascan.build/tx/',
    publicJsonRPCUrl: [
      'https://rpc.linea.build/',
      'https://linea.blockpi.network/v1/rpc/public',
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
  }
} as ChainInfo
