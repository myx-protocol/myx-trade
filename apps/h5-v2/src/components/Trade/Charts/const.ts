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
  create: Parameters<IChartWidgetApi['createStudy']>
}

export const IndicatorMap: Record<string, IIndicatorMap> = {
  MA: {
    name: 'Moving Average',
    type: IndicatorType.Main,
    symbol: 'MA',
    create: ['Moving Average', false, false, [9]],
  },
  EMA: {
    name: 'Moving Average Exponential',
    type: IndicatorType.Main,
    symbol: 'EMA',
    create: ['Moving Average Exponential', false, false, [9]],
  },
  BOLL: {
    name: 'Bollinger Bands',
    type: IndicatorType.Main,
    symbol: 'BOLL',
    create: ['Bollinger Bands', false, false, [20, 2]],
  },
  SAR: {
    name: 'Parabolic SAR',
    type: IndicatorType.Main,
    symbol: 'SAR',
    create: ['Parabolic SAR', false, false, [0.02, 0.02, 0.2]],
  },

  MACD: {
    name: 'MACD',
    type: IndicatorType.Sub,
    symbol: 'MACD',
    create: [
      'MACD',
      false,
      false,
      [14, 30, 'close', 9],
      {
        'Histogram.color.0': Colors.up,
        'Histogram.color.1': Colors.up2,
        'Histogram.color.2': Colors.down2,
        'Histogram.color.3': Colors.down,
      },
    ],
  },
  RSI: {
    name: 'Relative Strength Index',
    type: IndicatorType.Sub,
    symbol: 'RSI',
    create: ['Relative Strength Index', false, false, [14]],
  },
  KDJ: {
    name: 'Stochastic',
    type: IndicatorType.Sub,
    symbol: 'KDJ',
    create: ['Stochastic', false, false, [14, 1, 3]],
  },
  WR: {
    name: 'Williams %R',
    type: IndicatorType.Sub,
    symbol: 'WR',
    create: ['Williams %R', false, false, [14]],
  },
  StochRSI: {
    name: 'Stochastic RSI',
    type: IndicatorType.Sub,
    symbol: 'StochRSI',
    create: ['Stochastic RSI', false, false, [14, 14, 3, 3]],
  },
  CCI: {
    name: 'Commodity Channel Index',
    type: IndicatorType.Sub,
    symbol: 'CCI',
    create: ['Commodity Channel Index', false, false, [20]],
  },
  DMI: {
    name: 'Directional Movement',
    type: IndicatorType.Sub,
    symbol: 'DMI',
    create: ['Directional Movement', false, false, [14]],
  },
}
