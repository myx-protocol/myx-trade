import dayjs from 'dayjs'
import { ChartInterval } from '@/pages/Earn/type.ts'
import { i18n } from '@lingui/core'
import { t } from '@lingui/core/macro'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import type { EChartsOption } from 'echarts'

import * as echarts from 'echarts/core'
import { GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { BarChart, LineChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

type AxisExtent = { min: number; max: number }
echarts.use([
  GridComponent,
  GraphicComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
  BarChart,
  TooltipComponent,
])

export { echarts }

export const formatter = (interval: ChartInterval, params: any[]) => {
  const param = params[0]
  const time = param.data[0]
  const data = param.data[1]
  const date = new Date(time)

  return `<div style="display:flex;flex-direction: column; border-radius: 8px">
                   <p style="color: #848E9C;fontSize: 12">${dayjs(date)
                     .utc()
                     .format(`YYYY-MM-DD` + (interval === ChartInterval.day ? ' HH:mm' : ''))}</p>
                   <p style="margin-top: 12px;color: #848E9C;fontSize: 12">${i18n._(
                     t`Price`,
                   )} <span style="color: white">${formatNumberPrecision(data, COMMON_BASE_DISPLAY_DECIMALS)}
                  </span></p>
                </div>`
}

export const getAreaChartOptions = <T extends { time: number; value: number | string }>(
  interval: ChartInterval,
  list: T[] = [],
  options: EChartsOption = {},
) => {
  return {
    grid: {
      bottom: '0',
      left: '0',
      right: '0',
      show: false,
    },
    yAxis: {
      type: 'value',
      // boundaryGap: [0, '100%'],
      show: false,
      splitLine: { show: false },
      min: (value: AxisExtent) => (Math.floor((value.min * 1000) / 10) * 10) / 1000,
      max: (value: AxisExtent) => (Math.ceil((value.max * 1000) / 10) * 10) / 1000,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#2D3138',
      borderRadius: 8,
      borderWidth: 0,
      formatter: (params: any[]) => formatter(interval, params),
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'transparent',
        },
      },
    },
    xAxis: [
      {
        type: 'time',
        axisLine: {
          show: false,
          color: '#848E9C',
          fontSize: '12px',
        },
        axisLabel: {
          interval,
          formatter: (value: number) =>
            dayjs(value)
              .utc()
              .format(interval === ChartInterval.day ? ' HH:mm' : ' MM-DD'),
        },
        axisPointer: {
          type: 'line',
        },
        axisTick: {
          alignWithLabel: true,
          interval,
          show: false,
        },
      },
    ],
    series: [
      {
        type: 'line',
        showSymbol: false,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(0, 227, 165, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(0, 227, 165, 0)',
              },
            ],
            global: false,
          },
        },
        itemStyle: {
          normal: {
            symbol: 'emptyCircle',
            color: 'white',
          },
        },
        lineStyle: {
          color: '#00E3A5',
          width: 1,
        },
        data: (list || []).map((item) => [item.time * 1000, Number(item.value)]),
      },
    ],
    ...options,
  }
}
