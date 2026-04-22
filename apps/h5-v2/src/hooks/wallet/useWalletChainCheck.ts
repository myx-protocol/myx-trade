import { useAccount, useSwitchChain, useWalletClient } from 'wagmi'
import { useCallback } from 'react'
import { getAsSupportedChainIdFn } from '@/config/chain'
import { sleep } from '@/utils'

export const useWalletChainCheck = () => {
  const { chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { data: walletClient } = useWalletClient()

  const checkWalletChainId = useCallback(
    async (targetChainId?: number) => {
      const _targetChainId = getAsSupportedChainIdFn(targetChainId)
      if (isConnected && _targetChainId !== chainId) {
        const isBitget = connector?.id === 'com.bitget.web3'
        if (isBitget) {
          await walletClient?.switchChain({ id: _targetChainId })
        } else {
          await switchChainAsync({ chainId: _targetChainId })
        }
        await sleep(5000)
        return true
      }
      return Promise.resolve(true)
    },
    [chainId, isConnected, connector, switchChainAsync, walletClient],
  )

  return {
    checkWalletChainId,
  }
}
