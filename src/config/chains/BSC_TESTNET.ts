import { ChainId, ChainInfo } from "@/config/chain.ts";
import { GAS_FEE_RESERVED_RATIO } from './../fee'
import OpbnbLogo from '@/assets/icons/chain/logo/opbnb.png'

export default {
  chainId: ChainId.BSC_TESTNET,
  chainInfo: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://bsc-testnet-dataseed.bnbchain.org'],
    label: 'BNB Chain Testnet',
    chainSymbol: 'BNB Chain Testnet',
    explorer: 'https://testnet.bscscan.com/',
    explorerOfTX: 'https://testnet.bscscan.com/tx/',
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
 
} as ChainInfo
