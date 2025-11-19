import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useCallback, useEffect } from 'react'
import { useWalletStore } from '@/store/wallet/createStore'
import { LoginChannelEnum } from '@/store/wallet/types'

export const useWalletConnection = () => {
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const {
    setActiveAddress,
    setMoreLoginDrawerOpen,
    setRecentLoginType,
    setLoginChannel,
    setLoginModalOpen,
  } = useWalletStore()
  useEffect(() => {
    setActiveAddress(address || '')
  }, [address, setActiveAddress])

  const connectWallet = useCallback(
    async (walletItem: { id: string; connectorId: string; name: string }) => {
      try {
        const connector = connectors.find((connector) => connector.id === walletItem.connectorId)

        if (connector) {
          try {
            await connect({ connector })
          } catch (error) {
            throw error instanceof Error ? error : new Error(`连接 ${walletItem.name} 失败，请重试`)
          }
        } else {
          const walletConnectConnector = connectors.find(
            (connector) => connector.id === 'walletConnect',
          )

          if (walletConnectConnector) {
            await connect({ connector: walletConnectConnector })
          }
        }

        setMoreLoginDrawerOpen(false)
        setRecentLoginType(walletItem.id)
        setLoginModalOpen(false)
        setLoginChannel(LoginChannelEnum.WALLET)
      } catch (error) {
        console.error('钱包连接失败:', error)
        throw error instanceof Error ? error : new Error(`连接 ${walletItem.name} 失败，请重试`)
      }
    },
    [connect, connectors],
  )

  return {
    // 状态
    address,
    isConnected,
    isConnecting: isConnecting || isPending,
    error,
    connectors,
    connectWallet,
    disconnect,
    isWalletConnected: Boolean(isConnected && address),
    setLoginModalOpen,
    chainId,
  }
}
