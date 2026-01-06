import { useLeverageDialogStore } from '../Dialog/Leverage/store'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { ChainId, getAsSupportedChainIdFn } from '@/config/chain'
import useGlobalStore from '@/store/globalStore'
const DEFAULT_LEVERAGE = 1

export const useLeverage = (poolId?: string) => {
  const { chainId: currChainId } = useWalletConnection()
  const chainId = getAsSupportedChainIdFn(currChainId)
  const { leverageMap } = useLeverageDialogStore()
  const { maxLeverage } = useGlobalStore()

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
