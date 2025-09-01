export enum OrderType {
  MARKET = 0,
  LIMIT = 1,
  STOP = 2, // TPSL
  CONDITIONAL // CPSL
}

export enum TriggerType {
  NONE,
  GTE,
  LTE
}

export enum OperationType {
  INCREASE = 0,
  DECREASE = 1,
}

export enum Direction {
  LONG,
  SHORT
}


export enum TimeInForce {
  IOC = 0,
}

export const TIME_IN_FORCE: TimeInForce = TimeInForce.IOC
