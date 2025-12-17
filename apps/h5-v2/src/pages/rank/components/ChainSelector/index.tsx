import { ArrowDown } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useRankStore } from '../../store'
import { ChainsDrawer } from '@/components/ChainsDrawer'
import { useState } from 'react'

export const ChainSelector = () => {
  const { chainId, setChainId } = useRankStore()
  const [open, setOpen] = useState(false)
  return (
    <div className="flex min-w-[70px] shrink-0 gap-[2px] text-[#848E9C]">
      <p className="text-[12px]" role="button" onClick={() => setOpen(true)}>
        <Trans>All Chain</Trans>
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
