import { ArrowDown } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useRankStore } from '../../store'
import { ChainsDrawer } from '@/components/ChainsDrawer'
import { useMemo, useState } from 'react'
import { getChainInfo } from '@/config/chainInfo'

export const ChainSelector = () => {
  const { chainId, setChainId } = useRankStore()
  const [open, setOpen] = useState(false)
  const chainInfo = useMemo(() => {
    try {
      if (chainId === 0) {
        return null
      }
      return getChainInfo(chainId)
    } catch (_) {
      return null
    }
  }, [chainId])
  return (
    <div className="flex min-w-[70px] shrink-0 gap-[2px] text-[#848E9C]">
      <p className="text-[12px]" role="button" onClick={() => setOpen(true)}>
        {!chainId ? <Trans>All Chain</Trans> : chainInfo?.label}
      </p>
      <ArrowDown size={12} />
      <ChainsDrawer
        open={open}
        onClose={() => setOpen(false)}
        chainId={chainId}
        onChainChange={(chainId) => {
          setChainId(chainId as number)
          setOpen(false)
        }}
      />
    </div>
  )
}
