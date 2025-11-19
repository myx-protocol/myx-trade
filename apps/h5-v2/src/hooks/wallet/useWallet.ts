import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { useCallback } from 'react'

export const useWallet = () => {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors, error, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  // 连接 MetaMask
  const connectMetaMask = useCallback(() => {
    const metaMaskConnector = connectors.find((connector) => connector.id === 'metaMask')
    if (metaMaskConnector) {
      connect({ connector: metaMaskConnector })
    }
  }, [connect, connectors])

  // 连接 WalletConnect
  const connectWalletConnect = useCallback(() => {
    const walletConnectConnector = connectors.find((connector) => connector.id === 'walletConnect')
    if (walletConnectConnector) {
      connect({ connector: walletConnectConnector })
    }
  }, [connect, connectors])

  // 连接注入的钱包（如浏览器钱包）
  const connectInjected = useCallback(() => {
    const injectedConnector = connectors.find((connector) => connector.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }, [connect, connectors])

  // 断开连接
  const handleDisconnect = useCallback(() => {
    disconnect()
  }, [disconnect])

  // 切换网络
  const handleSwitchChain = useCallback(
    (targetChainId: number) => {
      switchChain({ chainId: targetChainId })
    },
    [switchChain],
  )

  // 格式化地址显示
  const formatAddress = useCallback((addr?: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }, [])

  return {
    // 状态
    address,
    isConnected,
    isConnecting: isConnecting || isReconnecting,
    isPending,
    chainId,
    error,
    connectors,

    // 方法
    connectMetaMask,
    connectWalletConnect,
    connectInjected,
    disconnect: handleDisconnect,
    switchChain: handleSwitchChain,
    formatAddress,

    // 格式化的地址
    formattedAddress: formatAddress(address),
  }
}
