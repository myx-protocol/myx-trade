import { useRef } from 'react'
import { TradingView, type TradingViewInstance } from './TradingView'
import { useMount, useUnmount } from 'ahooks'
import { klinePubSub } from '@/utils/pubsub'
import { toggleFullScreen } from '@/utils'
import { useTradePageStore } from '../store/TradePageStore'
import type {
  ChartingLibraryWidgetOptions,
  ResolutionString,
} from '@public/charting_library/charting_library'
import type { KlineTypeEnum } from './type'
import { ToolBar } from './Toolbar/index'
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

  const overridesChartOptions: Partial<ChartingLibraryWidgetOptions> = {
    disabled_features: [
      `header_screenshot`,
      `header_fullscreen_button`,
      'header_symbol_search',
      'header_widget',
      'header_chart_type',
      // 'header_settings',
      'header_saveload',
      'go_to_date',
      'header_compare',
      'popup_hints',
      'timeframes_toolbar',
      'header_undo_redo',
      'header_resolutions',
      'legend_widget',
      'create_volume_indicator_by_default',
      'save_chart_properties_to_local_storage',
    ],
  }
  return (
    <div
      className="mt-[4px] flex h-[320px] w-full flex-col gap-[6px] bg-[#101114]"
      ref={chartsRoot}
    >
      <ToolBar />
      <div className="flex flex-[1_1_0%] flex-col">
        <TradingView
          poolId={symbolInfo?.poolId}
          chainId={symbolInfo?.chainId}
          globalId={symbolInfo?.globalId}
          symbol={`${symbolInfo?.baseSymbol}${symbolInfo?.quoteSymbol}`}
          defaultInterval={resolutionActive as ResolutionString}
          ref={tradingViewRef}
          overridesChartOptions={overridesChartOptions}
        />
      </div>
    </div>
  )
}
