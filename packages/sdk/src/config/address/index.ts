import { ChainId, ContractAddress } from "@/config/chain"
import { ARB_TEST_SEPOLIA } from "./ARB_TEST_SEPOLIA"
import { ARB_BETA_SEPOLIA } from "./ARB_BETA_SEPOLIA"
import { LINEA_SEPOLIA } from "@/config/address/LINEA_SEPOLIA";
import { LINEA_BETA_SEPOLIA } from "@/config/address/LINEA_BETA_SEPOLIA";
import { BSC_TEST_NET } from "@/config/address/BSC_TEST_NET";
import { BSC_BETA_NET } from "@/config/address/BSC_BETA_NET";
import sdk from "@/web3";
import { BSC_MAINNET } from "./BSC_MAINET_NET";

export const getContractAddressByChainId = (chainId: ChainId): ContractAddress => {
  const { isBetaMode } = sdk?.getConfigManager()?.getConfig() || {};
  switch (chainId) {
    case ChainId.ARB_TESTNET:
      return isBetaMode ? ARB_BETA_SEPOLIA : ARB_TEST_SEPOLIA
    case ChainId.LINEA_SEPOLIA:
      return isBetaMode ? LINEA_BETA_SEPOLIA : LINEA_SEPOLIA
    case ChainId.BSC_TESTNET:
      return isBetaMode ? BSC_BETA_NET : BSC_TEST_NET
    case ChainId.BSC_MAINNET:
      return BSC_MAINNET

    default:
      return {} as ContractAddress
  }
}
