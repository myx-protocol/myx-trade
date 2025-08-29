import { ChainId, ContractAddress } from "@/config/chain"
import { ARB_TEST_SEPOLIA } from "./ARB_TEST_SEPOLIA"

export const getContractAddressByChainId = (chainId: ChainId): ContractAddress => {
  switch (chainId) {
    case ChainId.ARB_TESTNET:
      return ARB_TEST_SEPOLIA
    default:
      return {} as ContractAddress
  }
}
