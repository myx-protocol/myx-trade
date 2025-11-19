// 扩展 Window 接口以支持各种钱包
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      isTrust?: boolean
      isCoinbaseWallet?: boolean
      isOkxWallet?: boolean
      providers?: any[]
      request?: (args: { method: string; params?: any[] }) => Promise<any>
    }
    BinanceChain?: {
      bnbSign?: (
        address: string,
        message: string,
      ) => Promise<{ publicKey: string; signature: string }>
      switchNetwork?: (networkId: string) => Promise<string>
      requestAccounts?: () => Promise<string[]>
    }
    okxwallet?: any
    okex?: any
    trustwallet?: any
    bitkeep?: any
    keplr?: any
    phantom?: any
    coinbaseSolana?: any
  }
}

export {}
