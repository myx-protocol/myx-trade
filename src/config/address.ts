import { ChainId } from "./chain";
import { ARB_TEST_SEPOLIA } from "./address/ARB_TEST_SEPOLIA";
import { LINEA_SEPOLIA } from './address/LINEA_SEPOLIA'
import { BSC_TEST_NET } from './address/BSC_TEST_NET';

export default {
  [ChainId.ARB_TESTNET]: ARB_TEST_SEPOLIA,
  [ChainId.LINEA_SEPOLIA]: LINEA_SEPOLIA,
  [ChainId.BSC_TESTNET]: BSC_TEST_NET,
}

export const executeAddressByChainId = (chainId: ChainId) => {
  if (chainId === ChainId.ARB_TESTNET) {
    return '0x7e248ec1721639413a280d9e82e2862cae2e6e28'
  }

  if (chainId === ChainId.LINEA_SEPOLIA) {
    return ''
  }

  if (chainId === ChainId.BSC_TESTNET) {
    return ''
  }

  return ''
}