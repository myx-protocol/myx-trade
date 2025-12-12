import { usePoolSymbolsAll } from './usePoolSymbolsAll'

interface usePoolSymbolParams {
  poolId?: string
  chainId?: number
}

export const usePoolSymbol = ({ poolId, chainId }: usePoolSymbolParams) => {
  const { symbolDataAllMap } = usePoolSymbolsAll()
  if (!chainId || !poolId) return null
  return symbolDataAllMap[chainId]?.[poolId] ?? null
}
