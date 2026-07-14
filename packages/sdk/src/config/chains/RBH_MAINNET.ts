import { ChainId, ChainInfo } from "@/config/chain.js";
import { GAS_FEE_RESERVED_RATIO } from './../fee.js'

export default {
  chainId: ChainId.RBH_MAINNET,
  chainInfo: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://rpc.mainnet.chain.robinhood.com'],
    label: 'Robinhood',
    chainSymbol: 'Robinhood',
    explorer: 'https://robinhoodchain.blockscout.com/',
    explorerOfTX: 'https://robinhoodchain.blockscout.com/tx/',
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
