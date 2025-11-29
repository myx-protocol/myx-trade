import { ChainId, isSupportedChainFn, PROD_ENV_CHAIN_IDS } from '@/config/chain'
import { isProdMode } from '@/utils/env'
import { enumValues } from '@/utils'

export const isSupportedChainId = (chainId: string | number) => {
  return isProdMode() ? isSupportedChainFn(+chainId) : enumValues(ChainId).includes(+chainId)
}

export const isProdChainId = (chainId: string | number) => {
  return PROD_ENV_CHAIN_IDS.includes(+chainId)
}
