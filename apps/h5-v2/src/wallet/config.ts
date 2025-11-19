import { createConfig, http } from 'wagmi'
import { WALLET_CONNECT_PROJECT_ID } from '@/constant/wallet'
import { bscTestnet, lineaSepolia, arbitrumSepolia, bsc, arbitrum } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet, safe, metaMask } from 'wagmi/connectors'

// 初始化 WalletConnect Modal
if (typeof window !== 'undefined') {
  import('@walletconnect/modal').then(({ WalletConnectModal }) => {
    new WalletConnectModal({
      projectId: WALLET_CONNECT_PROJECT_ID,
      chains: ['421614'],
    })
  })
}

// 配置 transports
const transports = {
  [bscTestnet.id]: http(),
  [lineaSepolia.id]: http(),
  [arbitrumSepolia.id]: http(),
  [bsc.id]: http(),
  [arbitrum.id]: http(),
}

// 创建 Wagmi v2 配置
export const config = createConfig({
  chains: [bscTestnet, lineaSepolia, arbitrumSepolia, bsc, arbitrum],
  transports,
  ssr: false,
  batch: {
    multicall: false,
  },
  pollingInterval: 4000,
  connectors: [
    // MetaMask - 专用连接器
    metaMask({
      dappMetadata: {
        name: 'ATH Web App',
        url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      },
      extensionOnly: true, // 只允许浏览器扩展，避免桌面/移动选择弹窗
      useDeeplink: false, // 禁用深度链接，避免弹窗
      preferDesktop: false, // 不优先桌面版
      checkInstallationImmediately: true, // 立即检查安装状态
    }),

    // Binance Wallet - 专门配置（放在前面优先匹配）
    injected({
      shimDisconnect: true,
    }),

    // OKX Wallet - 支持多种检测方式
    injected({
      target: () => {
        // 检查多种可能的OKX钱包对象
        if (typeof window !== 'undefined') {
          if ((window as any).okxwallet) return (window as any).okxwallet
          if ((window as any).okex) return (window as any).okex
          if (window.ethereum && (window.ethereum as any).isOkxWallet) return window.ethereum
          if (window.ethereum?.providers) {
            const okxProvider = window.ethereum.providers.find((p: any) => p.isOkxWallet)
            if (okxProvider) return okxProvider
          }
        }
        return null
      },
      shimDisconnect: true,
    }),

    // Trust Wallet
    injected({
      target: 'trustWallet',
      shimDisconnect: true,
    }),

    // Uniswap Wallet
    injected({
      target: 'uniswapWallet',
      shimDisconnect: true,
    }),

    // Phantom Wallet
    injected({
      target: 'phantom',
      shimDisconnect: true,
    }),

    // Bitget Wallet
    injected({
      target: 'bitKeep',
      shimDisconnect: true,
    }),

    // 通用注入钱包（作为后备，放在最后）
    injected({
      shimDisconnect: true,
    }),

    // Coinbase Wallet
    coinbaseWallet({
      appName: 'ATH Web App',
      appLogoUrl: '/logo192.png',
    }),

    // WalletConnect
    walletConnect({
      projectId: WALLET_CONNECT_PROJECT_ID,
      showQrModal: true,
      qrModalOptions: {
        themeMode: 'light',
        themeVariables: {
          '--wcm-z-index': '10000',
        },
      },
      metadata: {
        name: 'MYX',
        description: 'MYX',
        url: 'https://m-trade-test.myx.cash',
        icons: ['/logo192.png'],
      },
    }),

    // Safe Wallet
    safe(),
  ],
})
