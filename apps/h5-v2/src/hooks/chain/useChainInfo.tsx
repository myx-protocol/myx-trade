import { getChainInfo } from '@/config/chainInfo'
import { useMemo } from 'react'

export const useChainInfo = (chainId?: number) => {
  return useMemo(() => {
    if (!chainId) return null
    try {
      return getChainInfo(chainId)
    } catch (error) {
      console.warn('useChainInfo', error)
      return null
    }
  }, [chainId])
}
