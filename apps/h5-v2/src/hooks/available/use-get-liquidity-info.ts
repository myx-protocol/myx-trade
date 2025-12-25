import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import useSWR from 'swr'
import useGlobalStore from '@/store/globalStore'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { ethers } from 'ethers'
import { useMemo } from 'react'

export type LiquidityInfo = {
  windowCaps: string
  openInterest: string
}

const DEFAULT_LIQUIDITY_INFO: LiquidityInfo = {
  windowCaps: '0',
  openInterest: '0',
}

export const useGetLiquidityInfo = () => {
  const { symbolInfo } = useGlobalStore()

  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[symbolInfo?.poolId || '']?.price
  const { client } = useMyxSdkClient()
  const { data } = useSWR(
    symbolInfo?.poolId && symbolInfo?.chainId && marketPrice
      ? ['get_liquidity_info', symbolInfo?.poolId, symbolInfo?.chainId, marketPrice]
      : null,
    async () => {
      if (!symbolInfo?.chainId || !symbolInfo?.poolId || !marketPrice) return DEFAULT_LIQUIDITY_INFO
      const rs = await client?.utils.getLiquidityInfo({
        chainId: symbolInfo?.chainId,
        poolId: symbolInfo?.poolId as string,
        marketPrice: ethers.parseUnits(marketPrice, 30).toString(),
      })

      const data = rs?.data ?? []
      const info = data[5] ?? []

      const liquidityInfo: LiquidityInfo = {
        windowCaps: info[0]?.toString() ?? '0',
        openInterest: info[1]?.toString() ?? '0',
      }

      return liquidityInfo
    },
  )

  const liquidityInfo = useMemo(() => {
    return data ?? DEFAULT_LIQUIDITY_INFO
  }, [data])

  return {
    liquidityInfo,
  }
}
