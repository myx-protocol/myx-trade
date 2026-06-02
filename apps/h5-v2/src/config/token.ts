import LogoUsdc from '@/assets/icon/chainIcon/usdc.svg'
import LogoUsdt from '@/assets/icon/chainIcon/usdt.svg'
import { getAddress } from 'ethers'
import { ChainId } from './chain'

export interface QuoteTokenInfo {
  chainId: number
  address: string
  symbol: string
  logoUrl: string
  name: string
}

export const QUOTE_TOKEN_LIST: Array<QuoteTokenInfo> = [
  {
    chainId: ChainId.ARB_TESTNET,
    address: '0x7E248Ec1721639413A280d9E82e2862Cae2E6E28',
    symbol: 'USDC',
    logoUrl: LogoUsdc,
    name: 'USD Coin',
  },
  {
    chainId: ChainId.ARB_MAINNET,
    address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    symbol: 'USDC',
    logoUrl: LogoUsdc,
    name: 'USD Coin',
  },
  {
    chainId: ChainId.LINEA_SEPOLIA,
    address: '0xD984fd34f91F92DA0586e1bE82E262fF27DC431b',
    symbol: 'USDC',
    logoUrl: LogoUsdc,
    name: 'USD Coin',
  },
  {
    chainId: ChainId.LINEA_MAINNET,
    address: '0x176211869cA2b568f2A7D4EE941E073a821EE1ff',
    symbol: 'USDC',
    logoUrl: LogoUsdc,
    name: 'USD Coin',
  },
  {
    chainId: ChainId.BSC_MAINNET,
    address: '0x8bfC51E1928e91e47c6734983aC018b2fC0aDf4e',
    symbol: 'BUSD',
    logoUrl: LogoUsdt,
    name: 'Binance USD',
  },
  {
    chainId: ChainId.BSC_TESTNET,
    address: '0xe944d7c0f7005a76E898Ee3B9Ec10479EbA9Cc02',
    symbol: 'BUSD',
    logoUrl: LogoUsdt,
    name: 'Binance USD',
  },
  {
    chainId: ChainId.BSC_MAINNET,
    address: '0x55d398326f99059ff775485246999027b3197955',
    symbol: 'USDT',
    logoUrl: LogoUsdt,
    name: 'Binance-Peg BSC-USD',
  },
  {
    chainId: ChainId.BSC_TESTNET,
    address: '0x9c452ef0e7b158f81a0e00a81aaea8ae04132cbc',
    symbol: 'USDT',
    logoUrl: LogoUsdt,
    name: 'Tether USD',
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
