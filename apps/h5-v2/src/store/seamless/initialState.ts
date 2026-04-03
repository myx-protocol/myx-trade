export type PoolIdAutAuthorized = {
  [poolId: string]: {
    authorized: boolean
  }
}

export interface SeamlessAccount {
  masterAddress: string
  seamlessAddress: string
  apiKey: string
  authorized: PoolIdAutAuthorized
}

export interface SeamlessState {
  seamlessAccountList: SeamlessAccount[]
  activeSeamlessAddress: string
  selectedSeamlessAddress: string
  activeSeamlessWallet: any
}

export const seamlessState: SeamlessState = {
  seamlessAccountList: [],
  activeSeamlessAddress: '',
  selectedSeamlessAddress: '',
  activeSeamlessWallet: null,
}
