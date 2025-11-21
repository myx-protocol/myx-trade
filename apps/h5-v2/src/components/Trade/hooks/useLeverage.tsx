import { useLeverageDialogStore } from '../Dialog/Leverage/store'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { ChainId } from '@/config/chain'
import { useTradePageStore } from '../store/TradePageStore'
const DEFAULT_LEVERAGE = 1

export const useLeverage = (poolId?: string) => {
  const { chainId } = useWalletConnection()
  const { leverageMap } = useLeverageDialogStore()
  const { maxLeverage } = useTradePageStore()

  let defaultLeverage = DEFAULT_LEVERAGE
  if (maxLeverage >= 20) {
    defaultLeverage = 10
  } else if (maxLeverage >= 10) {
    defaultLeverage = 5
  } else if (maxLeverage >= 2) {
    defaultLeverage = 2
  } else {
    defaultLeverage = 1
  }

  const leverage = leverageMap[chainId as ChainId]?.[poolId ?? '']?.leverage ?? defaultLeverage
  return leverage
}
