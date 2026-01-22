export type ChainIdAutAuthorized = {
  [chainId: number]: {
    authorized: boolean
  }
}

export interface SeamlessAccount {
  masterAddress: string
  seamlessAddress: string
  apiKey: string
  authorized: ChainIdAutAuthorized
}

export interface SeamlessState {
  seamlessAccountList: SeamlessAccount[]
  activeSeamlessAddress: string
  selectedSeamlessAddress: string
}

export const seamlessState: SeamlessState = {
  seamlessAccountList: [],
  activeSeamlessAddress: '',
  selectedSeamlessAddress: '',
}
