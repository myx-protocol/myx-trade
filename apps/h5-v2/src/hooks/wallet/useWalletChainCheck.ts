import { useAccount, useSwitchChain } from 'wagmi'
import { useCallback } from 'react'
import { getAsSupportedChainIdFn } from '@/config/chain'
import { sleep } from '@/utils'

export const useWalletChainCheck = () => {
  const { chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()

  const checkWalletChainId = useCallback(
    async (targetChainId?: number) => {
      const _targetChainId = getAsSupportedChainIdFn(targetChainId)
      if (isConnected && _targetChainId !== chainId) {
        try {
          await switchChainAsync({ chainId: _targetChainId })
        } catch (error: any) {
          if (error?.code === 4902 && connector) {
            const provider = await connector.getProvider()
            await (provider as any).request({
              method: 'wallet_addEthereumChain',
              params: [{ chainId: `0x${_targetChainId.toString(16)}` }],
            })
          } else {
            throw error
          }
        }
        await sleep(5000)
        return true
      }
      return Promise.resolve(true)
    },
    [chainId, isConnected, switchChainAsync, connector],
  )

  return {
    checkWalletChainId,
  }
}
