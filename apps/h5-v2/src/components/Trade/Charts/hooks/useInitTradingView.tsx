import { AVAILABLE_LOCALES } from '@/locales/locale'
import {
  type ChartingLibraryWidgetOptions,
  type IBasicDataFeed,
  type IChartingLibraryWidget,
  type LanguageCode,
  type ResolutionString,
} from '@public/charting_library/charting_library'
import { useCallback } from 'react'
import { Colors } from '../const'
import useGlobalStore from '@/store/globalStore'
import { merge } from 'lodash-es'

interface SetupTradingViewParams {
  language: AVAILABLE_LOCALES
  symbol: string
  interval: ResolutionString
  containerId: string
  dataFeed: IBasicDataFeed
}

export const useInitTradingView = () => {
  const { klineType } = useGlobalStore()
  const initTradingView = useCallback(
    (
      props: SetupTradingViewParams,
      overridesChartOptions?: Partial<ChartingLibraryWidgetOptions>,
    ) => {
      const { language, symbol, interval, containerId, dataFeed } = props
      /**
       * locale translation
       */
      let locale: LanguageCode = 'en'
      switch (language) {
        case AVAILABLE_LOCALES.ZH_CN:
          locale = 'zh'
          break
      }
      /**
       * widget options
       */
      const widgetOptions: ChartingLibraryWidgetOptions = {
        symbol: symbol,
        datafeed: dataFeed,
        interval: interval as ResolutionString,
        container: containerId,
        library_path: '/charting_library/',
        debug: false,
        autosize: true,
        locale: locale,
        time_scale: {
          min_bar_spacing: 3,
        },
        theme: 'Dark',
        custom_css_url: './css/chart_themed.css',
        loading_screen: {
          backgroundColor: '#101114',
        },
        overrides: {
          volumePaneSize: 'tiny',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.background': '#101114',
          'mainSeriesProperties.style': Number(klineType),
          'mainSeriesProperties.candleStyle.upColor': Colors.up,
          'mainSeriesProperties.candleStyle.wickUpColor': Colors.up,
          'mainSeriesProperties.candleStyle.borderUpColor': Colors.up,
          'mainSeriesProperties.candleStyle.wickDownColor': Colors.down,
          'mainSeriesProperties.candleStyle.downColor': Colors.down,
          'mainSeriesProperties.candleStyle.borderDownColor': Colors.down,
          'mainSeriesProperties.barStyle.upColor': Colors.up,
          'mainSeriesProperties.barStyle.downColor': Colors.down,
          'mainSeriesProperties.hollowCandleStyle.upColor': Colors.up,
          'mainSeriesProperties.hollowCandleStyle.downColor': Colors.down,
          'mainSeriesProperties.hollowCandleStyle.borderUpColor': Colors.up,
          'mainSeriesProperties.hollowCandleStyle.borderDownColor': Colors.down,
          'mainSeriesProperties.hollowCandleStyle.wickUpColor': Colors.up,
          'mainSeriesProperties.hollowCandleStyle.wickDownColor': Colors.down,
          'mainSeriesProperties.haStyle.upColor': Colors.up,
          'mainSeriesProperties.haStyle.downColor': Colors.down,
          'mainSeriesProperties.lineStyle.color': Colors.up,
          'mainSeriesProperties.areaStyle.color1': 'rgba(0, 227, 165, 0.30)',
          'mainSeriesProperties.areaStyle.color2': 'rgba(0, 227, 165, 0.00)',
          'mainSeriesProperties.areaStyle.linecolor': Colors.up,
          'mainSeriesProperties.baselineStyle.baselineColor': Colors.up,
          'mainSeriesProperties.baselineStyle.topFillColor1': 'rgba(0, 227, 165, 0.00)',
          'mainSeriesProperties.baselineStyle.topFillColor2': 'rgba(0, 227, 165, 0.30)',
          'mainSeriesProperties.baselineStyle.bottomFillColor1': 'rgba(236, 96, 90, .0)',
          'mainSeriesProperties.baselineStyle.bottomFillColor2': 'rgba(236, 96, 90, .3)',
          'mainSeriesProperties.baselineStyle.topLineColor': Colors.up,
          'mainSeriesProperties.baselineStyle.bottomLineColor': Colors.down,
        },
        studies_overrides: {},
        enabled_features: ['hide_left_toolbar_by_default', 'saveload_separate_drawings_storage'],
        disabled_features: [
          `header_screenshot`,
          `header_fullscreen_button`,
          'header_symbol_search',
          'header_widget',
          'header_chart_type',
          'header_settings',
          'header_saveload',
          'go_to_date',
          'header_compare',
          'popup_hints',
          'timeframes_toolbar',
          'header_undo_redo',
          'header_resolutions',
          'create_volume_indicator_by_default',
          'save_chart_properties_to_local_storage',
          // 'use_localstorage_for_settings',
        ],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ('Etc/UTC' as any),
      }

      /**
       * init widget
       */

      const widget = new window.TradingView.widget(
        merge(widgetOptions, overridesChartOptions || {}),
      ) as IChartingLibraryWidget

      /**
       * return widget
       */
      return {
        widget,
      }
    },
    [klineType],
  )

  return {
    initTradingView,
  }
}
