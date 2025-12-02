import { PriceInterval } from '@/request/type.ts'

export enum ChartInterval {
  day,
  week,
  all,
}
export const ChartIntervalValue: Record<ChartInterval, { value: PriceInterval; limit: number }> = {
  [ChartInterval.day]: {
    value: PriceInterval['10min'],
    limit: 144,
  },
  [ChartInterval.week]: {
    value: PriceInterval['1d'],
    limit: 7,
  },
  [ChartInterval.all]: {
    value: PriceInterval['1d'],
    limit: 365,
  },
}

export enum DetailTabType {
  Price,
  Trade,
  Introduction,
}

export enum Mode {
  Rise,
  Fall,
}
