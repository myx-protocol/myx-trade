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
    return '0xe944d7c0f7005a76e898ee3b9ec10479eba9cc02'
  }

  if(chainId === ChainId.BSC_MAINNET) {
    return '0x8bfc51e1928e91e47c6734983ac018b2fc0adf4e'
  }

  return ''
}
