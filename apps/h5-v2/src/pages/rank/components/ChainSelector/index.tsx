import { ArrowDown } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'

export const ChainSelector = () => {
  return (
    <div className="flex min-w-[70px] shrink-0 gap-[2px] text-[#848E9C]">
      <p className="text-[12px]">
        <Trans>All Chain</Trans>
      </p>
      <ArrowDown size={12} />
    </div>
  )
}
