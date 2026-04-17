import { useAccount, useSwitchChain } from 'wagmi'
import { useCallback } from 'react'
import { getAsSupportedChainIdFn } from '@/config/chain'
import { sleep } from '@/utils'

export const useWalletChainCheck = () => {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const checkWalletChainId = useCallback(
    async (targetChainId?: number) => {
      const _targetChainId = getAsSupportedChainIdFn(targetChainId)
      if (isConnected && _targetChainId !== chainId) {
        await switchChainAsync({ chainId: _targetChainId })
        await sleep(5000)
        return true
      }
      return Promise.resolve(true)
    },
    [chainId, switchChainAsync, isConnected],
  )

  return {
    checkWalletChainId,
  }
}
