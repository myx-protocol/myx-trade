import { useAccount, useSwitchChain } from 'wagmi'
import { useCallback, useEffect } from 'react'
import { getAsSupportedChainIdFn, isSupportedChainFn } from '@/config/chain'
import { sleep } from '@/utils'

export const useWalletChainCheck = () => {
  const { chainId, isConnected } = useAccount()
  const { switchChainAsync, switchChain } = useSwitchChain()
  useEffect(() => {
    console.log('useWalletChainCheck chainId', chainId)
  }, [chainId])

  const checkWalletChainId = useCallback(
    async (targetChainId?: number) => {
      const _targetChainId = getAsSupportedChainIdFn(targetChainId)
      if (isConnected && _targetChainId !== chainId) {
        console.log('[useWalletChainCheck] checkWalletChainId', { chainId, _targetChainId })
        await switchChainAsync(
          { chainId: _targetChainId },
          {
            onSuccess: (data, err) => {
              console.log('switchChainAsync success', data)
              console.log('switchChainAsync error', err)
            },
            onError: (err) => {
              console.log('switchChainAsync error', err)
            },
          },
        )
        console.log('[useWalletChainCheck] checkWalletChainId after switchChainAsync', {
          chainId,
          _targetChainId,
        })
        await sleep(3000)
        console.log('[useWalletChainCheck] checkWalletChainId after sleep', {
          chainId,
          _targetChainId,
        })
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
