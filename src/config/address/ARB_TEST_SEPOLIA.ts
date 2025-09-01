import { ContractAddress } from "@/config/chain";
import { ZeroAddress } from "ethers";

export const ARB_TEST_SEPOLIA: ContractAddress = {
  USDC: '',
  POOL_MANAGER: '0x14F3CF614F74be361890B59cD8EEB434E75540b3',
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
  LIQUIDITY_ROUTER:'0x8c9fD02bd552046d7c72d28b1Bf6dA77f7EbE4Da',
  BASE_POOL: '0xaacf18a4Ace57aEa7558d3779CcA5827A4E54c34',
  QUOTE_POOL:'0x04a850522EE86cc1e87f6Bce97e70016Dbf253AE',
}



