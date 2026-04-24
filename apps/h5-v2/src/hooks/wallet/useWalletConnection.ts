import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { useCallback, useEffect, useMemo } from 'react'
import { useWalletStore } from '@/store/wallet/createStore'
import { LoginChannelEnum } from '@/store/wallet/types'
import { getAsSupportedChainIdFn, isSupportedChainFn } from '@/config/chain'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { TradeMode } from '@/pages/Trade/types'

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

  const isWrongNetwork = useMemo(() => {
    return Boolean(address && isConnected && !isSupportedChainFn(chainId))
  }, [address, isConnected, chainId])

  // 钱包连接成功后，如果当前链不在支持列表中，自动切换到默认链
  // 优先使用当前路由中的 chainId（如 /trade/421614/...），其次回退到 getAsSupportedChainIdFn
  useEffect(() => {
    if (isConnected && chainId && !isSupportedChainFn(chainId)) {
      // 从 URL pathname 中解析 chainId，路由格式: /:page/:chainId/:poolId
      const pathSegments = window.location.pathname.split('/')
      const routeChainId = pathSegments[2] ? Number(pathSegments[2]) : undefined
      const targetChainId =
        routeChainId && isSupportedChainFn(routeChainId)
          ? routeChainId
          : getAsSupportedChainIdFn(chainId)
      switchChain?.(targetChainId)
    }
  }, [isConnected, chainId, switchChain])

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
  }
}
