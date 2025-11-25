import {
  type IChartingLibraryWidget,
  type ResolutionString,
  type SeriesStyle,
} from '@public/charting_library/charting_library'
import { useInitTradingView } from '../hooks/useInitTradingView'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import useGlobalStore from '@/store/globalStore'
import { useUnmount, useUpdateEffect } from 'ahooks'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { generateDataFeed } from '../lib/datafeed'
import type { KlineTypeEnum } from '../type'
import { appStorage } from '@/utils/storage'
import { Colors } from '../const'

interface TradingViewProps {
  poolId?: string
  defaultInterval?: ResolutionString
  onReady?: () => void
}

export interface TradingViewInstance {
  widget: IChartingLibraryWidget | null
  removeWidget: () => void
  setResolution: (resolution: ResolutionString) => void
  setKlineType: (klineType: KlineTypeEnum) => void
  setShowStudyPanel: () => void
  setShowSettingPanel: () => void
  setSymbol: (symbol: string) => void
  takeScreenshot: () => void
}

export const TradingView = forwardRef<TradingViewInstance, TradingViewProps>(
  ({ poolId, defaultInterval, onReady }, ref) => {
    const { activeLocale } = useGlobalStore()
    const { initTradingView } = useInitTradingView()
    const widgetRef = useRef<IChartingLibraryWidget>(null)
    const { client } = useMyxSdkClient()

    /**
     * init trading view widget
     */
    useEffect(() => {
      if (!widgetRef.current && poolId && client) {
        if (!client.subscription.isConnected) {
          client.subscription.connect()
        }
        const initPoolId = poolId
        const dataFeed = generateDataFeed(client)
        const { widget } = initTradingView({
          symbol: initPoolId,
          language: activeLocale,
          interval: defaultInterval as ResolutionString,
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
          onReady?.()
          if (initPoolId !== currentSymbolRef.current) {
            widget.activeChart().setSymbol(initPoolId)
            currentSymbolRef.current = initPoolId
          }
          widgetRef.current = widget
        })
      }
    }, [poolId, defaultInterval, activeLocale, initTradingView, client, onReady])

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
     * set symbol
     */

    const onSymbolChange = (poolId?: string) => {
      if (widgetRef.current && poolId && poolId !== currentSymbolRef.current) {
        widgetRef.current?.activeChart().setSymbol(poolId)
        currentSymbolRef.current = poolId
      }
    }

    /**
     * on symbol change
     */
    const currentSymbolRef = useRef(poolId)
    useUpdateEffect(() => {
      onSymbolChange(poolId)
    }, [poolId])

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

    //   cleanup pubsub
    useUnmount(() => {
      widgetRef.current?.remove()
      widgetRef.current = null
    })

    /**
     * expose intance
     */
    useImperativeHandle(ref, () => ({
      widget: widgetRef.current as IChartingLibraryWidget,
      removeWidget: () => {
        widgetRef.current?.remove()
      },
      setResolution: onResolutionChange,
      setKlineType: onKlineTypeChange,
      setShowStudyPanel: onShowStudyPanel,
      setShowSettingPanel: onShowSettingPanel,
      setSymbol: onSymbolChange,
      takeScreenshot: onTakeScreenshot,
    }))

    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-full w-full" id="tradingview_widget_container"></div>
      </div>
    )
  },
)
