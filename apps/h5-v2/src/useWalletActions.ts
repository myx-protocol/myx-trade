import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useConnect } from 'wagmi'
import { useWalletStore } from '@/store/wallet/createStore.ts'
import {
  ChainId,
  getAsSupportedChainIdFn,
  getSupportedChainIdsByEnv,
  isSupportedChainFn,
} from '@/config/chain.ts'
import { useWalletChainCheck } from '@/hooks/wallet/useWalletChainCheck.ts'

export const useWalletActions = () => {
  const { chainId } = useParams()
  const { chainId: currChainId, isWalletConnected } = useWalletConnection()
  const { checkWalletChainId } = useWalletChainCheck()
  const { setLoginModalOpen } = useWalletStore()
  const onAction = useCallback(
    async (_chainId?: string | number | ChainId) => {
      const targetChainId = _chainId ?? chainId
      if (!isWalletConnected) {
        setLoginModalOpen(true)
        return Promise.resolve(false)
      }

      const isSupportedChain = isSupportedChainFn(currChainId)
      if (!isSupportedChain) {
        if (targetChainId && isSupportedChainFn(+targetChainId)) {
          await checkWalletChainId(+targetChainId)
        } else {
          await checkWalletChainId(getAsSupportedChainIdFn())
        }
      } else if (targetChainId && Number(targetChainId) !== Number(currChainId)) {
        if (isSupportedChainFn(+targetChainId)) {
          await checkWalletChainId(+targetChainId)
        }
      }

      return Promise.resolve(true)
    },
    [currChainId, chainId, isWalletConnected, checkWalletChainId, setLoginModalOpen],
  )

  return onAction
}
