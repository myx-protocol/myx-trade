import LINEA_SEPOLIA from "@/config/chains/LINEA_SEPOLIA";
import ARB_SEPOLIA from "@/config/chains/ARB_SEPOLIA";
import ARB_MAINNET from "@/config/chains/ARB_MAINNET";
import {  ChainId } from "@/config/chain";


export type ChainInfoMap = { readonly [chainId: number]: any }
export const CHAIN_INFO: ChainInfoMap = {
  [ChainId.LINEA_TESTNET]: LINEA_SEPOLIA.chainInfo,
  [ChainId.ARB_TESTNET]:ARB_SEPOLIA.chainInfo,
  [ChainId.ARB_MAINNET]: ARB_MAINNET.chainInfo,
}

export function getChainInfo(chainId: ChainId) {
  const chainInfo = CHAIN_INFO[chainId]
  
  if (!chainInfo) {
    throw new Error(`Could not find information with chain id ${chainId}`)
  }
  
  return chainInfo
}
