import LogoUsdc from '@/assets/icon/chainIcon/usdc.svg'
import { getAddress } from 'ethers'
import { ChainId } from './chain'

interface QuoteTokenInfo {
  chainId: number
  address: string
  symbol: string
  logoUrl: string
}

export const QUOTE_TOKEN_LIST: Array<QuoteTokenInfo> = [
  {
    chainId: ChainId.ARB_TESTNET,
    address: '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28',
    symbol: 'USDC',
    logoUrl: LogoUsdc,
  },
]

interface QuoteTokenMap {
  [key: number]: Record<string, QuoteTokenInfo | null>
}

export const QUOTE_TOKEN_MAP = QUOTE_TOKEN_LIST.reduce((acc, item) => {
  acc[item.chainId] = {
    [getAddress(item.address)]: item,
  }
  return acc
}, {} as QuoteTokenMap)

export const getQuoteTokenInfo = (chainId?: number, address?: string) => {
  if (!chainId || !address) return null
  return QUOTE_TOKEN_MAP[chainId]?.[getAddress(address)]
}
