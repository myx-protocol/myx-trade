/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

// declare module 'swr' {
//   interface SWRResponse {
//     isLagging: boolean
//     resetLaggy: () => void
//   }
// }

declare global {
  interface ImportMetaEnvGlob {
    readonly VITE_APP_APP_ENV: 'production' | 'development' | 'dev' | 'test' | 'beta'
    readonly VITE_GOOGLE_AG_ID?: string
    readonly VITE_GLOB_API_URL_PREFIX?: string
    readonly VITE_GLOB_API_URL: string
    readonly VITE_GLOB_CHAIN_ID: number
    readonly VITE_GLOB_PROXY?: [string, string][]
    readonly VITE_QUESTION_TRADE_ID: number
    readonly VITE_QUESTION_VIP_ID: number
    readonly VITE_WS_URL: string
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ImportMetaEnv extends ImportMetaEnvGlob {}

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }

  type Nilable<T> = T | undefined | null

  type CanWrite<T> = {
    -readonly [K in keyof T]: T[K] extends Record<any, any> ? CanWrite<T[K]> : T[K]
  }

  type Prettify<T> = {
    [K in keyof T]: T[K]
  } & {}

  type DeepRequired<T> = T extends Function
    ? T
    : T extends object
    ? { [P in keyof T]-?: DeepRequired<Required<T[P]>> }
    : T

  interface EthereumProvider {
    // set by the Coinbase Wallet mobile dapp browser
    isCoinbaseWallet?: true
    // set by the Brave browser when using built-in wallet
    isBraveWallet?: true
    // set by the MetaMask browser extension (also set by Brave browser when using built-in wallet)
    isMetaMask?: true
    // set by the Rabby browser extension
    isRabby?: true
    // set by the Trust Wallet browser extension
    isTrust?: true
    // set by the Ledger Extension Web 3 browser extension
    isLedgerConnect?: true
    // set by the OKX Wallet browser extension
    isOkxWallet?: true
    autoRefreshOnNetworkChange?: boolean
  }

  interface Window {
    ethereum?: EthereumProvider
    okxwallet?: EthereumProvider
    chrome?: any
    okexchain?: any
    solana?: any
  }
  
  type FilterKeysByStart<T, Start> = {
    [K in keyof T]: K extends `${Start}${string}` ? never : K
  }[keyof T]
}

export {}
