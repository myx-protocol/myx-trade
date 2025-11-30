import { type IChartWidgetApi, type EntityId } from '@public/charting_library/charting_library'

export const resolution = [1, 5, 15, 30, 60, 240, '1D', '1W', '1M']

export const resolutionDefaultList: (string | number)[] = [5, 15, 60, 240]

export const dropDownMenuOptions = resolution.filter((item) => {
  if (!resolutionDefaultList.includes(item)) return item
  return undefined
})

export const Colors = {
  down: '#EC605A',
  down2: '#993E3A',
  up: '#00E3A5',
  up2: '#008C66',
}

export enum IndicatorType {
  Main,
  Sub,
}

export interface IIndicatorMap {
  name: string
  type: IndicatorType
  symbol: string
  create: (chart: IChartWidgetApi) => Promise<EntityId | null>
}

export const IndicatorMap: Record<string, IIndicatorMap> = {
  MA: {
    name: 'Moving Average',
    type: IndicatorType.Main,
    symbol: 'MA',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Moving Average', false, false, [9]),
  },
  EMA: {
    name: 'Moving Average Exponential',
    type: IndicatorType.Main,
    symbol: 'EMA',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Moving Average Exponential', false, false, [9]),
  },
  BOLL: {
    name: 'Bollinger Bands',
    type: IndicatorType.Main,
    symbol: 'BOLL',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Bollinger Bands', false, false, [20, 2]),
  },
  SAR: {
    name: 'Parabolic SAR',
    type: IndicatorType.Main,
    symbol: 'SAR',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Parabolic SAR', false, false, [0.02, 0.02, 0.2]),
  },

  MACD: {
    name: 'MACD',
    type: IndicatorType.Sub,
    symbol: 'MACD',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('MACD', false, false, [14, 30, 'close', 9], {
        'Histogram.color.0': Colors.up,
        'Histogram.color.1': Colors.up2,
        'Histogram.color.2': Colors.down2,
        'Histogram.color.3': Colors.down,
      }),
  },
  RSI: {
    name: 'Relative Strength Index',
    type: IndicatorType.Sub,
    symbol: 'RSI',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Relative Strength Index', false, false, [14]),
  },
  KDJ: {
    name: 'Stochastic',
    type: IndicatorType.Sub,
    symbol: 'KDJ',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Stochastic', false, false, [14, 1, 3]),
  },
  WR: {
    name: 'Williams %R',
    type: IndicatorType.Sub,
    symbol: 'WR',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Williams %R', false, false, [14]),
  },
  StochRSI: {
    name: 'Stochastic RSI',
    type: IndicatorType.Sub,
    symbol: 'StochRSI',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Stochastic RSI', false, false, [14, 14, 3, 3]),
  },
  CCI: {
    name: 'Commodity Channel Index',
    type: IndicatorType.Sub,
    symbol: 'CCI',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Commodity Channel Index', false, false, [20]),
  },
  DMI: {
    name: 'Directional Movement',
    type: IndicatorType.Sub,
    symbol: 'DMI',
    create: async (chart: IChartWidgetApi) =>
      await chart.createStudy('Directional Movement', false, false, [14]),
  },
}
