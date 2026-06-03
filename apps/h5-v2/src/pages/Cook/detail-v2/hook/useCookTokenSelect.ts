import { getQuoteTokenInfo } from '@/config/token'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { MarketPoolState, SearchTypeEnum } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import { datalist } from 'framer-motion/client'
import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'

interface UseCookTokenSelectProps {
  chainId?: number
  keyword?: string
}

export interface CookTokenItem {
  chainId: number
  address: Address
  tokenName: string
  tokenSymbol: string
  tokenIcon?: string
}

interface BaseTokenMapQuoteToken {
  [key: string]: Set<Address>
}

export type CookPoolRoute = { chainId: number; poolId: string }

export type FindCookPoolFn = (
  chainId: number,
  baseAddress: string,
  quoteAddress: string,
) => CookPoolRoute | undefined

export const useCookTokenSelect = ({ chainId = 0, keyword = '' }: UseCookTokenSelectProps) => {
  const { client } = useMyxSdkClient()
  const { data: dataList = null, isLoading } = useQuery({
    queryKey: ['cook-token-select', chainId, keyword],
    enabled: !!client,
    queryFn: async () => {
      if (!client) return null
      const res = await client.markets.searchMarket({
        searchKey: keyword,
        chainId,
        searchType: SearchTypeEnum.Cooking,
      })
      return res
    },
    select: (data) => data?.cookV2Info?.list || [],
  })

  const { tokenInfoMap, baseTokenMapQuoteToken, baseTokenList } = useMemo(() => {
    const tokenInfoMap: Map<Address, CookTokenItem> = new Map()
    const baseToQuotes = {} as BaseTokenMapQuoteToken
    // 只展示可交易状态
    const poolList = (dataList || []).filter(
      (item) => item.state !== MarketPoolState.Trench && item.state !== MarketPoolState.PreBench,
    )

    if (poolList?.length) {
      poolList.forEach((item) => {
        const quoteTokenAddress = item.quoteToken
        const baseTokenAddress = item.baseToken
        // create base token info map
        if (!tokenInfoMap.has(baseTokenAddress)) {
          tokenInfoMap.set(baseTokenAddress, {
            chainId: item.chainId,
            address: baseTokenAddress,
            tokenName: item.symbolName,
            tokenSymbol: item.baseSymbol,
            tokenIcon: item.tokenIcon,
          })
        }

        if (!tokenInfoMap.has(quoteTokenAddress)) {
          const quoteTokenInfo = getQuoteTokenInfo(item.chainId, quoteTokenAddress)
          const quoteSymbol = quoteTokenInfo?.symbol ?? item.quoteSymbol
          tokenInfoMap.set(quoteTokenAddress, {
            chainId: item.chainId,
            address: quoteTokenAddress,
            tokenName: quoteSymbol,
            tokenSymbol: quoteSymbol,
            tokenIcon: quoteTokenInfo?.logoUrl,
          })
        }

        // create base token map quote token map
        if (!baseToQuotes[baseTokenAddress]) {
          baseToQuotes[baseTokenAddress] = new Set([quoteTokenAddress])
        } else {
          baseToQuotes[baseTokenAddress].add(quoteTokenAddress)
        }
      })
    }

    const baseTokenMapQuoteToken: Record<string, Address[]> = {}
    for (const [baseAddr, quoteAddrSet] of Object.entries(baseToQuotes)) {
      baseTokenMapQuoteToken[baseAddr] = Array.from(quoteAddrSet)
    }

    return {
      tokenInfoMap,
      baseTokenMapQuoteToken,
      baseTokenList: Object.keys(baseToQuotes),
    }
  }, [dataList])

  const findCookPool = useCallback<FindCookPoolFn>(
    (cid, baseAddress, quoteAddress) => {
      if (!dataList?.length) return undefined
      const b = baseAddress.toLowerCase()
      const q = quoteAddress.toLowerCase()
      const row = dataList.find(
        (item: { chainId: number; baseToken: string; quoteToken: string; poolId: string }) =>
          item.chainId === cid &&
          item.baseToken.toLowerCase() === b &&
          item.quoteToken.toLowerCase() === q,
      )
      return row ? { chainId: row.chainId, poolId: row.poolId } : undefined
    },
    [dataList],
  )

  return {
    tokenInfoMap,
    baseTokenMapQuoteToken,
    baseTokenList,
    isLoading,
    findCookPool,
  }
}
