import { useAccount, useSwitchChain, useWalletClient } from 'wagmi'
import { useCallback } from 'react'
import { getAsSupportedChainIdFn } from '@/config/chain'
import { sleep } from '@/utils'

export const useWalletChainCheck = () => {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { data: walletClient } = useWalletClient()

  const checkWalletChainId = useCallback(
    async (targetChainId?: number) => {
      const _targetChainId = getAsSupportedChainIdFn(targetChainId)
      if (isConnected && _targetChainId !== chainId) {
        try {
          await switchChainAsync({ chainId: _targetChainId })
        } catch {
          console.log('error switchChainAsync', _targetChainId)
          await walletClient?.switchChain({ id: _targetChainId })
        }
        await sleep(5000)
        return true
      }
      return Promise.resolve(true)
    },
    [chainId, isConnected, switchChainAsync, walletClient],
  )

  return {
    checkWalletChainId,
  }
}
