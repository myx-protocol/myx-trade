import {
  type IChartingLibraryWidget,
  type ResolutionString,
  type SeriesStyle,
} from '@public/charting_library/charting_library'
import { useInitTradingView } from '../hooks/useInitTradingView'
import { useEffect, useRef } from 'react'
import { useTradePageStore } from '../../store/TradePageStore'
import useGlobalStore from '@/store/globalStore'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { generateDataFeed } from '../lib/datafeed'
import { tradePubSub } from '@/utils/pubsub'
import type { KlineTypeEnum } from '../type'
import { appStorage } from '@/utils/storage'
import { Colors } from '../const'

export const TradingView = () => {
  const { symbolInfo, resolutionActive } = useTradePageStore()
  const { activeLocale } = useGlobalStore()
  const { initTradingView } = useInitTradingView()
  const widgetRef = useRef<IChartingLibraryWidget>(null)
  const { client } = useMyxSdkClient()

  /**
   * init trading view widget
   */
  useEffect(() => {
    if (!widgetRef.current && symbolInfo?.poolId && client) {
      if (!client.subscription.isConnected) {
        client.subscription.connect()
      }
      const initPoolId = symbolInfo.poolId
      const dataFeed = generateDataFeed(client)
      const { widget } = initTradingView({
        symbol: initPoolId,
        language: activeLocale,
        interval: resolutionActive as ResolutionString,
        containerId: 'tradingview_widget_container',
        dataFeed,
      })

      const saveStudyTemplate = (widget: IChartingLibraryWidget) => {
        const options = { saveSymbol: false, saveInterval: false }
        const template = widget.activeChart().createStudyTemplate(options)
        appStorage.studyTemplate.set(template)
      }

      widget.onChartReady(async () => {
        const stored_template = appStorage.studyTemplate.get()
        let template = stored_template || undefined
        if (template && template.symbol) {
          appStorage.studyTemplate.remove()
          template = undefined
        }
        if (template) {
          widget.activeChart().applyStudyTemplate(template)
        } else {
          await widget.activeChart().createStudy('MACD', false, false, [14, 30, 'close', 9], {
            'Histogram.color.0': Colors.up,
            'Histogram.color.1': Colors.up2,
            'Histogram.color.2': Colors.down2,
            'Histogram.color.3': Colors.down,
          })
        }

        widget.subscribe('study_event', () => {
          saveStudyTemplate(widget)
        })

        widget
          .activeChart()
          .onIntervalChanged()
          .subscribe(null, () => {
            saveStudyTemplate(widget)
          })
        widget.subscribe('study', () => {
          saveStudyTemplate(widget)
        })

        widget.subscribe('study_properties_changed', () => {
          saveStudyTemplate(widget)
        })

        tradePubSub.emit('kline:ready')
        if (initPoolId !== currentSymbolRef.current) {
          widget.activeChart().setSymbol(initPoolId)
          currentSymbolRef.current = initPoolId
        }
        widgetRef.current = widget
      })
    }
  }, [symbolInfo, resolutionActive, activeLocale, initTradingView, client])

  /**
   * on resolution change
   */
  const onResolutionChange = (value: number | string) => {
    if (widgetRef.current) {
      widgetRef.current.activeChart().setResolution(value as ResolutionString)
    }
  }

  /**
   * on kline type change
   */
  const onKlineTypeChange = (value: KlineTypeEnum) => {
    if (widgetRef.current) {
      widgetRef.current.activeChart().setChartType(value as unknown as SeriesStyle)
    }
  }

  /**
   * show study panel
   */
  const onShowStudyPanel = () => {
    if (widgetRef.current) {
      widgetRef.current.activeChart().executeActionById('insertIndicator')
    }
  }

  /**
   * show setting panel
   */
  const onShowSettingPanel = () => {
    if (widgetRef.current) {
      widgetRef.current.activeChart().executeActionById('chartProperties')
    }
  }

  /**
   * on symbol change
   */
  const currentSymbolRef = useRef(symbolInfo?.poolId)
  useUpdateEffect(() => {
    if (widgetRef.current && symbolInfo?.poolId && symbolInfo.poolId !== currentSymbolRef.current) {
      widgetRef.current?.activeChart().setSymbol(symbolInfo.poolId)
      currentSymbolRef.current = symbolInfo.poolId
    }
  }, [symbolInfo?.poolId])

  /**
   * take screenshot
   */
  const takeScreenshotLoadingRef = useRef(false)
  const onTakeScreenshot = () => {
    if (widgetRef.current && !takeScreenshotLoadingRef.current) {
      const onTakeScreenHotReady = (fileName: string) => {
        window.open(`https://www.tradingview.com/x/${fileName}`, '_blank')
        widgetRef.current?.unsubscribe('onScreenshotReady', onTakeScreenHotReady)
        takeScreenshotLoadingRef.current = false
      }
      widgetRef.current?.subscribe('onScreenshotReady', onTakeScreenHotReady)
      widgetRef.current?.takeScreenshot()
      takeScreenshotLoadingRef.current = true
    }
  }

  //   setup pubsub
  useMount(() => {
    tradePubSub.on('kline:resolution:change', onResolutionChange)
    tradePubSub.on('kline:type:change', onKlineTypeChange)
    tradePubSub.on('kline:show:study:panel', onShowStudyPanel)
    tradePubSub.on('kline:show:setting:panel', onShowSettingPanel)
    tradePubSub.on('kline:take:screenshot', onTakeScreenshot)
  })

  //   cleanup pubsub
  useUnmount(() => {
    widgetRef.current?.remove()
    widgetRef.current = null
    tradePubSub.off('kline:resolution:change', onResolutionChange)
    tradePubSub.off('kline:type:change', onKlineTypeChange)
    tradePubSub.off('kline:show:study:panel', onShowStudyPanel)
    tradePubSub.off('kline:show:setting:panel', onShowSettingPanel)
    tradePubSub.off('kline:take:screenshot', onTakeScreenshot)
  })

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-full w-full" id="tradingview_widget_container"></div>
    </div>
  )
}
