export const OrderType = {
  MARKET: 0,
  LIMIT: 1,
  STOP: 2, // TPSL
  CONDITIONAL: 3 // CPSL
} as const;

export type OrderType = typeof OrderType[keyof typeof OrderType];

export const TriggerType = {
  NONE: 0,
  GTE: 1,
  LTE: 2
} as const;

export type TriggerType = typeof TriggerType[keyof typeof TriggerType];

export const OperationType = {
  INCREASE: 0,
  DECREASE: 1,
} as const;

export type OperationType = typeof OperationType[keyof typeof OperationType];

export const Direction = {
  LONG: 0,
  SHORT: 1
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

export const TimeInForce = {
  IOC: 0,
} as const;

export type TimeInForce = typeof TimeInForce[keyof typeof TimeInForce];

export const TIME_IN_FORCE: TimeInForce = TimeInForce.IOC;