import { useRef } from 'react'
import { Toolbar } from './Toolbar'
import { TradingView, type TradingViewInstance } from './TradingView'
import { useMount, useUnmount } from 'ahooks'
import { klinePubSub } from '@/utils/pubsub'
import { toggleFullScreen } from '@/utils'
import { useTradePageStore } from '../store/TradePageStore'
import type { ResolutionString } from '@public/charting_library/charting_library'
import type { KlineTypeEnum } from './type'
export const Charts = () => {
  const chartsRoot = useRef<HTMLDivElement>(null)
  const { resolutionActive, symbolInfo } = useTradePageStore()

  const onFullScreenToggle = () => {
    if (chartsRoot.current) {
      toggleFullScreen(chartsRoot.current)
    }
  }

  const tradingViewRef = useRef<TradingViewInstance>(null)
  const onResolutionChange = (value: number | string) => {
    tradingViewRef.current?.setResolution(value as ResolutionString)
  }
  const onKlineTypeChange = (value: KlineTypeEnum) => {
    tradingViewRef.current?.setKlineType(value)
  }
  const onShowStudyPanel = () => {
    tradingViewRef.current?.setShowStudyPanel()
  }
  const onShowSettingPanel = () => {
    tradingViewRef.current?.setShowSettingPanel()
  }
  const onTakeScreenshot = () => {
    tradingViewRef.current?.takeScreenshot()
  }

  useMount(() => {
    klinePubSub.on('kline:full:screen:toggle', onFullScreenToggle)
    //   setup pubsub
    klinePubSub.on('kline:resolution:change', onResolutionChange)
    klinePubSub.on('kline:type:change', onKlineTypeChange)
    klinePubSub.on('kline:show:study:panel', onShowStudyPanel)
    klinePubSub.on('kline:show:setting:panel', onShowSettingPanel)
    klinePubSub.on('kline:take:screenshot', onTakeScreenshot)
  })

  useUnmount(() => {
    klinePubSub.off('kline:full:screen:toggle', onFullScreenToggle)

    klinePubSub.off('kline:resolution:change', onResolutionChange)
    klinePubSub.off('kline:type:change', onKlineTypeChange)
    klinePubSub.off('kline:show:study:panel', onShowStudyPanel)
    klinePubSub.off('kline:show:setting:panel', onShowSettingPanel)
    klinePubSub.off('kline:take:screenshot', onTakeScreenshot)
  })
  return (
    <div
      className="mt-[4px] flex h-[528px] w-full flex-col gap-[6px] bg-[#101114]"
      ref={chartsRoot}
    >
      <Toolbar />
      <div className="flex flex-[1_1_0%] flex-col">
        <TradingView
          poolId={symbolInfo?.poolId}
          chainId={symbolInfo?.chainId}
          globalId={symbolInfo?.globalId}
          symbol={`${symbolInfo?.baseSymbol}${symbolInfo?.quoteSymbol}`}
          defaultInterval={resolutionActive as ResolutionString}
          ref={tradingViewRef}
        />
      </div>
    </div>
  )
}
