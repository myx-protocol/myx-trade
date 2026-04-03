import { useMemo } from 'react'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { DepthChart } from '@/components/DepthChart'
import type { OrderBookItem } from '@/components/DepthChart/types'
import { generateDepthData } from './depthChartData'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { SuspenseLoading } from '@/components/Loading'
import { usePoolInfo } from '../../hooks/usePoolInfo'
import { formatUnits } from 'viem'
import { usePoolSymbol } from '@/hooks/pool/usePoolSymbol'

/** 将 generateDepthChartData 输出转为 DepthChart 所需的 bids/asks 格式
 * DepthChart: buy[0] 画在中心(最高买价)，buy[last] 画在左侧(最低买价)
 * depthChartData: bids 按 price 升序 → 需反转，使最高价在前(中心)、最低价在后(左)
 */
function toOrderBookFormat(raw: {
  shortData: { x: number; y: number }[]
  longData: { x: number; y: number }[]
}): { bids: OrderBookItem[]; asks: OrderBookItem[] } {
  const toItem = (p: number, s: number): OrderBookItem => [String(p), String(s)]
  // shortData 作为买单买盘（buy/bids），左侧显示，滑点导致价格低于 basePrice
  const bids = raw.shortData.reverse().map((item) => toItem(item.x, item.y))
  // longData 作为卖单卖盘（sell/asks），右侧显示，滑点导致价格高于 basePrice
  const asks = raw.longData.map((item) => toItem(item.x, item.y))
  return { bids, asks }
}

interface DepthProps {
  chainId?: number
  poolId?: string
}

export const Depth = ({ chainId, poolId }: DepthProps) => {
  const tickerData = useMarketStore().tickerData
  const { poolConfig, isLoading: isLoadingPoolConfig } = useGetPoolConfig(poolId, chainId)

  const latestPrice = poolId ? tickerData?.[poolId]?.price : 0
  const { data: poolInfo, isLoading: isLoadingPoolInfo } = usePoolInfo({
    poolId: poolId,
    chainId: chainId,
  })

  const isDepthLoading = isLoadingPoolConfig || !poolConfig || !latestPrice || isLoadingPoolInfo

  const symbolInfo = usePoolSymbol({
    poolId,
    chainId,
  })

  const orderBookData = useMemo(() => {
    if (isDepthLoading || !poolConfig || !latestPrice || !symbolInfo) return null
    const tracker = poolInfo?.ioTracker?.tracker // unformatted bn
    const OI =
      tracker != null ? Number(formatUnits(BigInt(tracker), symbolInfo?.baseDecimals || 18)) : 0
    const raw = generateDepthData(
      OI,
      poolConfig.levelConfig.lockLiquidity,
      poolConfig.levelConfig.slip,
      Number(latestPrice),
    )
    return {
      ...toOrderBookFormat(raw),
      basePrice: raw.basePrice,
    }
  }, [poolConfig, latestPrice, poolInfo, isDepthLoading, symbolInfo])
  return (
    <div className="relative flex h-full w-full flex-col pb-[8px] select-none">
      {orderBookData && (
        <DepthChart
          bids={orderBookData.bids}
          asks={orderBookData.asks}
          lastPrice={String(orderBookData.basePrice)}
          colors={{
            buyColor: '#00E3A5',
            buyOpacityColor: 'rgba(0, 227, 165, 0.15)',
            sellColor: '#EC605A',
            sellOpacityColor: 'rgba(236, 96, 90, 0.15)',
            axisColor: '#202129',
            tooltipBgColor: '#2D3138',
            tooltipTextColor: '#fff',
          }}
          className="h-full w-full"
          style={{ backgroundColor: 'transparent', minHeight: 0 }}
        />
      )}
      {isDepthLoading && (
        <div className="absolute top-0 left-0 z-10 flex h-full w-full items-center justify-center bg-[#101114]">
          <SuspenseLoading block />
        </div>
      )}
    </div>
  )
}
