import { StudyList } from '@/components/Trade/Charts/StudyList'
import { TradingView } from '@/components/Trade/Charts/TradingView'
import { usePriceStore } from '../../store'
import { useRef } from 'react'
import type { TradingViewInstance } from '@/components/Trade/Charts/TradingView'
import type { ResolutionString } from '@public/charting_library/charting_library'
import { useMount, useUnmount } from 'ahooks'
import { klinePubSub } from '@/utils/pubsub'
import { ToolBar } from '@/components/Trade/Charts/Toolbar'
export const Chart = () => {
  const { symbolInfo } = usePriceStore()
  const tradingViewRef = useRef<TradingViewInstance>(null)
  const onResolutionChange = (value: number | string) => {
    tradingViewRef.current?.setResolution(value as ResolutionString)
  }
  useMount(() => {
    klinePubSub.on('kline:resolution:change', onResolutionChange)
  })

  useUnmount(() => {
    klinePubSub.off('kline:resolution:change', onResolutionChange)
  })
  return (
    <div>
      <ToolBar showStudyPanel />
      <div className="h-[484px] w-full">
        <TradingView
          poolId={symbolInfo?.poolId}
          chainId={symbolInfo?.chainId}
          globalId={symbolInfo?.globalId}
          symbol={`${symbolInfo?.baseSymbol}${symbolInfo?.quoteSymbol}`}
          ref={tradingViewRef}
        />
      </div>
      <div className="mt-[4px]">
        <StudyList />
      </div>
    </div>
  )
}
