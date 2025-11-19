import type { LoginChannel, RecentLoginType } from './types'
import { LoginChannelEnum } from './types'

export interface WalletState {
  loginModalOpen: boolean
  activeChainId: number
  activeAddress: string
  loginChannel: LoginChannel
  recentLoginType: string | RecentLoginType
  moreLoginDrawerOpen: boolean
}

export const walletState: WalletState = {
  loginModalOpen: false,
  activeChainId: 1,
  activeAddress: '',
  loginChannel: LoginChannelEnum.WALLET,
  recentLoginType: '',
  moreLoginDrawerOpen: false,
}
