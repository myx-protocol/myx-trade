import { StudyList } from '@/components/Trade/Charts/StudyList'
import { TradingView } from '@/components/Trade/Charts/TradingView'
import { useRef, useState } from 'react'
import type { TradingViewInstance } from '@/components/Trade/Charts/TradingView'
import type { ResolutionString } from '@public/charting_library/charting_library'
import { useMount, useUnmount } from 'ahooks'
import { klinePubSub } from '@/utils/pubsub'
import { ToolBar } from '@/components/Trade/Charts/Toolbar'
import { useChartsStore } from '@/components/Trade/Charts/store'
import useGlobalStore from '@/store/globalStore'
import { ChartTypeEnum } from '@/components/Trade/Charts/type'
import { Depth } from '@/components/Trade/Charts/Depth'
import { usePoolNoTradable } from '@/hooks/pool/usePoolNoTradable'
import { NoTradeable } from '@/components/Trade/Charts/NoTradeable'

export const Chart = () => {
  const { symbolInfo } = useGlobalStore()
  const { activeResolution } = useChartsStore()
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
  const [chartType, setChartType] = useState(ChartTypeEnum.TradingView)
  const { isNoTradable } = usePoolNoTradable({
    poolId: symbolInfo?.poolId,
    chainId: symbolInfo?.chainId,
  })
  return (
    <div>
      <ToolBar
        showResolution={chartType === ChartTypeEnum.TradingView}
        showStudyPanel={chartType === ChartTypeEnum.TradingView && !isNoTradable}
        chartType={chartType}
        onChartTypeChange={setChartType}
      />

      {isNoTradable && (
        <div className="h-[330px] w-full">
          <NoTradeable poolId={symbolInfo?.poolId} chainId={symbolInfo?.chainId} />
        </div>
      )}
      {!isNoTradable && (
        <>
          {chartType === ChartTypeEnum.TradingView ? (
            <div className="h-[484px] w-full">
              <TradingView
                poolId={symbolInfo?.poolId}
                chainId={symbolInfo?.chainId}
                globalId={symbolInfo?.globalId}
                symbol={`${symbolInfo?.baseSymbol}${symbolInfo?.quoteSymbol}`}
                ref={tradingViewRef}
                defaultInterval={activeResolution as ResolutionString}
              />
            </div>
          ) : (
            <div className="h-[312px]">
              <Depth poolId={symbolInfo?.poolId} chainId={symbolInfo?.chainId} />
            </div>
          )}
          <div className="mt-[4px]">
            <StudyList />
          </div>
        </>
      )}
    </div>
  )
}
