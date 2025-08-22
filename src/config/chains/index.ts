import LINEA_SEPOLIA from "@/config/chains/LINEA_SEPOLIA.ts";
import ARB_SEPOLIA from "@/config/chains/ARB_SEPOLIA.ts";
import BSC_TESTNET from "@/config/chains/BSC_TESTNET.ts";
import LINEA_MAINNET from "@/config/chains/LINEA_MAINNET.ts";
import ARB_MAINNET from "@/config/chains/ARB_MAINNET.ts";
import BSC_MAINNET from "@/config/chains/BSC_MAINNET.ts";
import { BaseChainInfo, ChainId } from "@/config/chain.ts";


export type ChainInfoMap = { readonly [chainId: number]: BaseChainInfo }
export const CHAIN_INFO: ChainInfoMap = {
  [ChainId.LINEA_SEPOLIA]: LINEA_SEPOLIA.chainInfo,
  [ChainId.ARB_TESTNET]:ARB_SEPOLIA.chainInfo,
  [ChainId.BSC_TESTNET]:BSC_TESTNET.chainInfo,
  [ChainId.LINEA_MAINNET]: LINEA_MAINNET.chainInfo,
  [ChainId.ARB_MAINNET]: ARB_MAINNET.chainInfo,
  [ChainId.BSC_MAINNET]: BSC_MAINNET.chainInfo,
}

export function getChainInfo(chainId: ChainId) {
  const chainInfo = CHAIN_INFO[chainId]
  
  if (!chainInfo) {
    throw new Error(`Could not find information with chain id ${chainId}`)
  }
  
  return chainInfo
}
