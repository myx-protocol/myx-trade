import { ContractAddress } from "@/config/chain";
import { ZeroAddress } from "ethers";

export const ARB_TEST_SEPOLIA: ContractAddress = {
  USDC: '',
  POOL_MANAGER: '0xBA10850ECfe805842F67A54C57a72f06b101B47f',
  POOL_VIEW: '',
  HYPER_VAULT: ZeroAddress,
  FEE_COLLECTOR: '',
  POSITION_MANAGER: '',
  ORDER_MANAGER: '',
  TRUSTED_FORWARDER: '',
  FRONT_FACET: '', // router address
  DELEGATE_FACET: '', // Seamless router address
  FAUCET: '',
  UI_POOL_DATA_PROVIDER: '',
  UI_POSITION_DATA_PROVIDER: '',
  PYTH: '',
  MYX: ZeroAddress,
  ERC20: '',
  LIQUIDITY_ROUTER:'0x743232Da0B1Ab57923D82c850FDB00E0A0A2B5b8',
  BASE_POOL: '0x456C057395EB271b24bC7Be81e9890e4Aa76476B',
  QUOTE_POOL:'0xe8824Ae9c9518d45790C0354C211738229085fB0',
}



