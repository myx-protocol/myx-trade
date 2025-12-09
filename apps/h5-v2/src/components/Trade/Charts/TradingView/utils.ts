export interface TradingViewSymbol {
  chainId?: number
  poolId?: string
  globalId?: number
  symbol?: string
}

export const buildTradingViewSymbol = ({
  chainId,
  globalId,
  poolId,
  symbol,
}: TradingViewSymbol) => {
  if (!chainId || !globalId || !poolId || !symbol) {
    return null
  }
  return `${chainId}:${globalId}:${poolId}:${symbol}`
}

export const parseTradingViewSymbol = (ticker: string): Required<TradingViewSymbol> => {
  const [chainId, globalId, poolId, symbol] = ticker.split(':')
  return {
    chainId: parseInt(chainId),
    globalId: parseInt(globalId),
    poolId,
    symbol,
  }
}
