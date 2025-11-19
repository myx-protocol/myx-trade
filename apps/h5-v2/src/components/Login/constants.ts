import googleIcon from '@/assets/icon/social/google.svg'
import appleIcon from '@/assets/icon/social/apple.svg'
import twitterIcon from '@/assets/icon/social/twitter.svg'
import discordIcon from '@/assets/icon/social/discord.svg'
import facebookIcon from '@/assets/icon/social/Facebook.svg'
import microsoftIcon from '@/assets/icon/social/microsoft.svg'
import telegramIcon from '@/assets/icon/social/telegram.svg'
import emailIcon from '@/assets/icon/social/email.svg'
import metamaskIcon from '@/assets/icon/wallet/metamask.svg'
import binanceIcon from '@/assets/icon/wallet/binance.png'
import okxIcon from '@/assets/icon/wallet/okx.png'
import coinbaseIcon from '@/assets/icon/wallet/coinbase.svg'
import trustIcon from '@/assets/icon/wallet/trust.png'
import bitgetIcon from '@/assets/icon/wallet/bitget.png'
import keplrIcon from '@/assets/icon/wallet/keplr.png'
import { AuthType } from '@particle-network/auth-core'

export type SocialLoginType =
  | 'email'
  | 'twitter'
  | 'google'
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'microsoft'
  | 'telegram'

export const socialList: Array<{
  type: SocialLoginType
  name: string
  id: string
  icon: string
  socialLoginType: AuthType
}> = [
  {
    type: 'google',
    name: 'Google',
    icon: googleIcon,
    id: 'google',
    socialLoginType: AuthType.google,
  },
  { type: 'apple', name: 'Apple', icon: appleIcon, id: 'apple', socialLoginType: AuthType.apple },
  {
    type: 'twitter',
    name: 'X (Twitter)',
    icon: twitterIcon,
    id: 'twitter',
    socialLoginType: AuthType.twitter,
  },
  {
    type: 'discord',
    name: 'Discord',
    icon: discordIcon,
    id: 'discord',
    socialLoginType: AuthType.discord,
  },
  {
    type: 'facebook',
    name: 'Facebook',
    icon: facebookIcon,
    id: 'facebook',
    socialLoginType: AuthType.facebook,
  },
  {
    type: 'microsoft',
    name: 'Microsoft',
    icon: microsoftIcon,
    id: 'microsoft',
    socialLoginType: AuthType.microsoft,
  },
  {
    type: 'telegram',
    name: 'Telegram',
    icon: telegramIcon,
    id: 'telegram',
    socialLoginType: AuthType.telegram,
  },
  { type: 'email', name: 'Email', icon: emailIcon, id: 'email', socialLoginType: AuthType.email },
]

export const walletList: Array<{
  id: string
  connectorId: string
  name: string
  icon: string
}> = [
  {
    id: 'metaMask',
    connectorId: 'metaMaskSDK',
    name: 'MetaMask',
    icon: metamaskIcon,
  },
  {
    id: 'binance',
    connectorId: 'com.binance.wallet',
    name: 'Binance Wallet',
    icon: binanceIcon,
  },
  {
    id: 'okx',
    connectorId: 'com.okex.wallet',
    name: 'OKX Wallet',
    icon: okxIcon,
  },
  {
    id: 'coinbase',
    connectorId: 'coinbaseWalletSDK',
    name: 'Coinbase Wallet',
    icon: coinbaseIcon,
  },
  {
    id: 'trust',
    connectorId: '"trustWallet"',
    name: 'Trust Wallet',
    icon: trustIcon,
  },
  {
    id: 'bitget',
    connectorId: 'com.bitget.web3',
    name: 'Bitget Wallet',
    icon: bitgetIcon,
  },
  {
    id: 'keplr',
    connectorId: 'walletConnect',
    name: 'Keplr',
    icon: keplrIcon,
  },
]
