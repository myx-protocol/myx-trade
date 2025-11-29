import { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection.ts'
import { useConnect } from 'wagmi'
import { useWalletStore } from '@/store/wallet/createStore.ts'
import {
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
  const onAction = useCallback(async () => {
    console.log(isWalletConnected)
    if (!isWalletConnected) {
      setLoginModalOpen(true)
      return Promise.reject()
    }

    const isSupportedChain = isSupportedChainFn(currChainId)
    if (!isSupportedChain) {
      if (chainId && isSupportedChainFn(+chainId)) {
        await checkWalletChainId(+chainId)
      } else {
        await checkWalletChainId(getAsSupportedChainIdFn())
      }
    } else if (chainId && Number(chainId) !== Number(currChainId)) {
      if (isSupportedChainFn(+chainId)) {
        await checkWalletChainId(+chainId)
      }
    }

    return Promise.resolve(true)
  }, [currChainId, chainId, isWalletConnected, checkWalletChainId, setLoginModalOpen])

  return onAction
}
