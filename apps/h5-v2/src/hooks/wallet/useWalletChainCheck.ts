import { useAccount, useSwitchChain, useWalletClient } from 'wagmi'
import { useCallback } from 'react'
import { getAsSupportedChainIdFn } from '@/config/chain'

export const useWalletChainCheck = () => {
  const { chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { refetch: refetchWalletClient } = useWalletClient()

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

        // poll the provider directly until it confirms the chain switch
        if (connector) {
          const maxWait = 15000
          const interval = 300
          let elapsed = 0
          while (elapsed < maxWait) {
            await new Promise((r) => setTimeout(r, interval))
            elapsed += interval
            const provider = await connector.getProvider()
            const current = await (provider as any).request({ method: 'eth_chainId' })
            if (parseInt(current, 16) === _targetChainId) break
          }
        }

        // wait for wagmi's wallet client to reflect the new chain so the SDK
        // doesn't pick up a stale client (chain mismatch on the next tx)
        const wcMaxWait = 5000
        const wcInterval = 200
        let wcElapsed = 0
        while (wcElapsed < wcMaxWait) {
          const { data: wc } = await refetchWalletClient()
          if (wc?.chain?.id === _targetChainId) break
          await new Promise((r) => setTimeout(r, wcInterval))
          wcElapsed += wcInterval
        }

        return true
      }
      return Promise.resolve(true)
    },
    [chainId, isConnected, switchChainAsync, connector, refetchWalletClient],
  )

  return {
    checkWalletChainId,
  }
}
