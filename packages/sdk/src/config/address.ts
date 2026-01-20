import { ChainId } from "./chain";
export { getContractAddressByChainId } from "./address/index";

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
