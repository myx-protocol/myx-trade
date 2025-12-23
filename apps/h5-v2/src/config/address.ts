import type { Address } from 'viem'
import { ChainId } from './chain'
import LogoUSDC from '@/assets/token-imgs/usdc.webp'

export interface ChainTokenInfo {
  symbol: string
  logo: string
}

export const CHAINS_TOKEN_INFO: Record<number, Record<Address, ChainTokenInfo>> = {
  [ChainId.ARB_TESTNET]: {
    '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28': {
      symbol: 'USDC',
      logo: LogoUSDC,
    },
  },
  [ChainId.LINEA_SEPOLIA]: {
    '0xD984fd34f91F92DA0586e1bE82E262fF27DC431b': {
      symbol: 'USDC',
      logo: LogoUSDC,
    },
  },
}

export const getChainsTokenInfo = (
  chainId: number,
  tokenAddress: Address,
): ChainTokenInfo | null => {
  return CHAINS_TOKEN_INFO[chainId]?.[tokenAddress] || null
}
