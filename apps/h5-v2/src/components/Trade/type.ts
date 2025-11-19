// order type limit/market
export enum OrderTypeEnum {
  LIMIT = 'limit',
  MARKET = 'market',
}

// order side buy/sell
export enum OrderSideEnum {
  BUY = 'buy',
  SELL = 'sell',
}

// position mode isolated/margin
export enum PositionModeEnum {
  ISOLATED = 'isolated',
  MARGIN = 'margin',
}

// position action open/close
export enum PositionActionEnum {
  OPEN = 'open',
  CLOSE = 'close',
}

// amount unit quote/base
export enum AmountUnitEnum {
  QUOTE = 'QUOTE',
  BASE = 'BASE',
}

export enum TpSlTypeEnum {
  PRICE = 'price',
  ROI = 'roi',
  Change = 'change',
  Pnl = 'pnl',
}
