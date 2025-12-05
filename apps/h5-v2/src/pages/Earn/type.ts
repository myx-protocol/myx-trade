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

export enum VaultType {
  Positions,
  Vaults,
}

export interface Vault {
  name: string
  label: string
  icon: string
  rating: string
  apr: string
  tvl: number
  deposits: string
  pnl: string
  chainId: number
  address: string
  symbol: string
  time: number
  poolId: string
  id: number
  sortValue: any
  idx: number
  quotePoolToken: string
  avgLpPrice: string
}

export enum SortField {
  apr = 'quoteApr',
  tvl = 'quoteTvl',
  time = 'tokenCreateTime',
  deposits = 'deposit',
  pnl = 'pnl',
}
