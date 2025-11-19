import { getChainInfo } from '@/config/chainInfo'
import { openUrl } from '@/utils'
import { truncateString } from '@/utils/string'
import { useMemo } from 'react'

export const TransactionHash = ({ hash, chainId }: { hash: string; chainId?: number }) => {
  const chainInfo = useMemo(() => {
    if (!chainId) return null
    return getChainInfo(chainId)
  }, [chainId])

  const handleClick = () => {
    if (chainInfo?.explorer) {
      openUrl(`${chainInfo.explorer}/tx/${hash}`)
    }
  }
  return (
    <span className="border-b-[1px] border-dashed" role="button" onClick={handleClick}>
      {truncateString(hash, 10, 4)}
    </span>
  )
}
