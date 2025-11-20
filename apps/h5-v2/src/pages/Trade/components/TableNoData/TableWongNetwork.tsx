import NetworkPng from '@/assets/images/common/network.png'
import { Trans } from '@lingui/react/macro'
export const TableWongNetwork = () => {
  return (
    <div className="flex h-[252px] flex-shrink-0 flex-col items-center justify-center">
      <img src={NetworkPng} alt="empty" className="h-[56px] w-[72px]" />
      <p className="text-danger mt-[12px] text-[12px] font-medium">
        <Trans>Network error</Trans>
      </p>
    </div>
  )
}
