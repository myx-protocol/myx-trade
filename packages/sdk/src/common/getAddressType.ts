import type { Address } from 'viem'
import { getPublicClient } from "@/web3";
import { ChainId } from "@/config/chain.js";
export type AddressType = 'eoa' | 'contract' | 'eip7702'

export async function getAddressType(
  chainId: ChainId,
  address: Address
): Promise<AddressType> {
  const publicClient = getPublicClient(chainId);
  const code = await publicClient.getCode({
    address,
    blockTag: 'latest'
  })
  
  // 普通 EOA
  if (!code || code === '0x') {
    return 'eoa'
  }
  
  // EIP-7702 delegated EOA
  if (code.startsWith('0xef0100')) {
    return 'eip7702'
  }
  
  // 普通合约
  return 'contract'
}

export async function isWalletAddress(
  chainId: ChainId,
  address: Address
): Promise<boolean> {
  const type = await getAddressType(chainId, address)
  return type === 'eoa' || type === 'eip7702'
}

export async function isContractOnCurrentChain(
  chainId: ChainId,
  address: Address
): Promise<boolean> {
  return (await getAddressType(chainId, address)) === 'contract'
}
