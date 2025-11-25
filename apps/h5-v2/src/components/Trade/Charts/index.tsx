import { useRef } from 'react'
import { Toolbar } from './Toolbar'
import { TradingView, type TradingViewInstance } from './TradingView'
import { useMount, useUnmount } from 'ahooks'
import { tradePubSub } from '@/utils/pubsub'
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
    tradePubSub.on('kline:full:screen:toggle', onFullScreenToggle)
    //   setup pubsub
    tradePubSub.on('kline:resolution:change', onResolutionChange)
    tradePubSub.on('kline:type:change', onKlineTypeChange)
    tradePubSub.on('kline:show:study:panel', onShowStudyPanel)
    tradePubSub.on('kline:show:setting:panel', onShowSettingPanel)
    tradePubSub.on('kline:take:screenshot', onTakeScreenshot)
  })

  useUnmount(() => {
    tradePubSub.off('kline:full:screen:toggle', onFullScreenToggle)

    tradePubSub.off('kline:resolution:change', onResolutionChange)
    tradePubSub.off('kline:type:change', onKlineTypeChange)
    tradePubSub.off('kline:show:study:panel', onShowStudyPanel)
    tradePubSub.off('kline:show:setting:panel', onShowSettingPanel)
    tradePubSub.off('kline:take:screenshot', onTakeScreenshot)
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
          defaultInterval={resolutionActive as ResolutionString}
          ref={tradingViewRef}
        />
      </div>
    </div>
  )
}
