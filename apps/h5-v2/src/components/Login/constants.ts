import metamaskIcon from '@/assets/icon/wallet/metamask.svg'
import binanceIcon from '@/assets/icon/wallet/binance.png'
import okxIcon from '@/assets/icon/wallet/okx.png'
import coinbaseIcon from '@/assets/icon/wallet/coinbase.svg'
import trustIcon from '@/assets/icon/wallet/trust.png'
import bitgetIcon from '@/assets/icon/wallet/bitget.png'
import keplrIcon from '@/assets/icon/wallet/keplr.png'

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
