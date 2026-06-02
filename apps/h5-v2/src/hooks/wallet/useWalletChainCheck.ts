import { useAccount, useSwitchChain } from 'wagmi'
import { useCallback } from 'react'
import { getAsSupportedChainIdFn, isSupportedChainFn } from '@/config/chain'
import { sleep } from '@/utils'

export const useWalletChainCheck = () => {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const checkWalletChainId = useCallback(
    async (targetChainId?: number) => {
      const _targetChainId = getAsSupportedChainIdFn(targetChainId)
      if (isConnected && _targetChainId !== chainId) {
        await switchChainAsync({ chainId: _targetChainId })
        await sleep(3000)
        return false
      }
      return Promise.resolve(true)
    },
    [chainId, switchChainAsync, isConnected],
  )

  return {
    checkWalletChainId,
  }
}
