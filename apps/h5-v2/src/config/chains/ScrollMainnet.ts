import { GAS_FEE_RESERVED_RATIO } from '@/config/fee'
import ScrollLogo from '@/assets/icon/commons/chain/logo/scroll.png'

export const ScrollMainnet = {
  chainId: 534352,
  chainInfo: {
    privateJsonRPCUrl: '',
    publicJsonRPCUrl: ['https://rpc.scroll.io/'],
    label: 'Scroll Mainnet',
    chainSymbol: 'Scroll Mainnet',
    explorer: 'https://scrollscan.com/',
    explorerOfTX: 'https://scrollscan.com/tx/',
    logoUrl: ScrollLogo,
    gasPriceRatio: 1.6,
    gasLimitRatio: 1.3,
    gasAmountRatio: 2,
    gasFeeReservedForCollateral: (0 + 0) * GAS_FEE_RESERVED_RATIO,
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  POOL_ADDRESS: '0x740a7C5Ef2F71Edb446F016a3D52a916f8fb2cE7',
  POOL_VIEW_ADDRESS: '0x40C93C0960e0d0FBF45Dd6Cf936e6F77f01c9af2',
  ORDER_MANAGER_ADDRESS: '0x30ab7f9926c275Ca315FddCfC0781A52462eb4A1',
  FAUCET_ADDRESS: '0x2D93d41a5861E96CDB751a1Bf06c57Df39499867',
  ROUTER_ADDRESS: '0x204618ABC9Bf0718768991e622D1A47dFCa0833a',
  UI_POOL_DATA_ADDRESS: '0x25F6f3b5Fe0e1c9DE3ffEe8606ebbDF6eF7486dC',
  UI_POSITION_DATA_ADDRESS: '0xFFeA6d703BBD2CCee4bD37E8cA880438086D09Bb',
  POSITION_MANAGER_ADDRESS: '0x39949658F80f8F493C0a1b7d6A38690C85d6EeEB',
  FeeCollector_ADDRESS: '0x7C5a78e2Cb51bCC0331157a32FB11B76436a97A5',
  PYTH_ADDRESS: '',
  FORWARDER_ADDRESS: '',
  USDC_ADDRESSES: '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
  WETH_ADDRESSES: '0x5300000000000000000000000000000000000004',
  MULTICALL_ADDRESSES: '0x1301aa1FDAA0bC5180342740D854eC65056f0c5F',
  API_URLS: 'https://api-scroll.myx.finance',
  API_DOCS_JSON_URLS: '',
  WEBSOCKET_URLS: 'wss://ws-scroll.myx.finance/websocket',
  RETRY_OPTIONS_BY_CHAIN_ID: { n: 15, minWait: 250, maxWait: 3500 },
  GAS_URL: '', // src/hooks/price/index.ts gas_url
  HYPERVAULT_ADDRESS: '',
}
