export const TabType = {
  POSITION: 'position',
  FINANCE: 'finance',
  ENTRUSTS: 'entrusts',
  HISTORY: 'history',
  POSITION_HISTORY: 'position_history',
  ORDER_HISTORY: 'order_history',
} as const

export type TabType = (typeof TabType)[keyof typeof TabType]

export const TradeMode = {
  Classic: 'classic',
  Seamless: 'seamless',
} as const

export type TradeMode = (typeof TradeMode)[keyof typeof TradeMode]
