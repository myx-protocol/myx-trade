import { ChainId, ContractAddress } from "@/config/chain"

import { BSC_MAINNET } from "./BSC_MAINNET"
import { BSC_TESTNET } from "./BSC_TESTNET"
import { ARB_TEST_SEPOLIA } from "./ARB_TEST_SEPOLIA"
import { LINEA_TEST_SEPOLIA } from "./LINEA_TEST_SEPOLIA"
import { ARB_MAINNET } from "@/config/address/ARB_MAINNET.ts";
import { LINEA_MAINNET } from "@/config/address/LINEA_MAINNET.ts";

export const getContractAddressByChainId = (chainId: ChainId): ContractAddress => {
  switch (chainId) {
    case ChainId.BSC_MAINNET:
      return BSC_MAINNET
    case ChainId.BSC_TESTNET:
      return BSC_TESTNET
    case ChainId.ARB_TESTNET:
      return ARB_TEST_SEPOLIA
    case ChainId.LINEA_SEPOLIA:
      return LINEA_TEST_SEPOLIA
    case ChainId.ARB_MAINNET:
      return ARB_MAINNET
    case ChainId.LINEA_MAINNET:
      return LINEA_MAINNET
    default:
      return {} as ContractAddress
  }
}
