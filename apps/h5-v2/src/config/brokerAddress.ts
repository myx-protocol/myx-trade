import { isBetaMode } from '@/utils/env'
import { ChainId } from '@myx-trade/sdk'

export const getMyxBrokerAddressByChainId = (chainId: number) => {
  const brokerAddressMap: Record<number, string> = {
    [ChainId.ARB_TESTNET]: isBetaMode()
      ? '0x4A3054177DBdC01BfcA007FB45d9A9803eBc2eA4'
      : '0x69a7dC1638B98dD4734e690bE5bAba835d562d9e',
    [ChainId.LINEA_SEPOLIA]: isBetaMode() ? '' : '0x6C4655D0034c74f82B3769749cacDb6Df5cC4862',
    [ChainId.BSC_TESTNET]: isBetaMode() ? '0x144E5067E690635b2cbeE10D96f431D143739f48' : '',
    [ChainId.BSC_MAINNET]: '0xB4d04AB1F870F3865F6cE1336cEdff56d0f937a3',
  }

  return brokerAddressMap[chainId]
}
