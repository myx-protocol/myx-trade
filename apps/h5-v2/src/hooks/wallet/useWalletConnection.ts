import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { useCallback, useEffect, useMemo } from 'react'
import { useWalletStore } from '@/store/wallet/createStore'
import { LoginChannelEnum } from '@/store/wallet/types'
import { isSupportedChainFn } from '@/config/chain'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '@/pages/Trade/types'
import { detectInAppBrowser } from '@/utils'

export const useWalletConnection = () => {
  const { address, isConnected, isConnecting, chainId } = useAccount()
  const { tradeMode } = useGlobalStore()
  const { activeSeamlessAddress } = useSeamlessStore()
  const { connect, connectors, error, isPending } = useConnect()
  const { resetStore } = useTradePanelStore()
  const { disconnect } = useDisconnect()
  const { switchChain: switchChainWagmi } = useSwitchChain()

  const switchChain = useCallback(
    (targetChainId: number) => {
      switchChainWagmi({ chainId: targetChainId })
    },
    [switchChainWagmi],
  )

  const {
    setActiveAddress,
    setMoreLoginDrawerOpen,
    setRecentLoginType,
    setLoginChannel,
    setLoginModalOpen,
  } = useWalletStore()

  useEffect(() => {
    setActiveAddress(address || '')
  }, [address, setActiveAddress, resetStore, tradeMode, activeSeamlessAddress])

  // console.log('activeSeamlessAddress-->',tradeMode, activeSeamlessAddress)

  const connectWallet = useCallback(
    async (walletItem: { id: string; connectorId: string; name: string }) => {
      try {
        let connector = connectors.find((c) => c.id === walletItem.connectorId)

        // In in-app browsers, EIP-6963 RDNS may not be available, so the registered
        // connector ID won't match the expected connectorId (e.g. 'com.bitget.web3').
        // Fall back to the provider-specific or generic injected connector instead of
        // jumping straight to WalletConnect (which shows a QR code modal that's useless
        // in an in-app browser).
        if (!connector) {
          const inApp = detectInAppBrowser()
          if (inApp) {
            connector = connectors.find((c) => inApp.connectorIds.includes(c.id))
          }
        }

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

  const isWrongNetwork = useMemo(() => {
    return Boolean(address && isConnected && !isSupportedChainFn(chainId))
  }, [address, isConnected, chainId])

  // console.log('activeSeamlessAddress-->', activeSeamlessAddress)

  return {
    // 状态
    address: tradeMode === TradeMode.Seamless ? activeSeamlessAddress : address,
    isConnected,
    isConnecting: isConnecting || isPending,
    error,
    connectors,
    connectWallet,
    disconnect,
    isWalletConnected: Boolean(isConnected && address),
    setLoginModalOpen,
    chainId,
    isWrongNetwork,
    switchChain,
    // null = 普通浏览器；有值 = 内置浏览器，只应展示对应钱包
    inAppWallet: detectInAppBrowser(),
  }
}
