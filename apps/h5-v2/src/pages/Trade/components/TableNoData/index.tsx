import EmptyPng from '@/assets/images/common/empty.png'
import { Trans } from '@lingui/react/macro'

export const TableNoData = () => {
  return (
    <div className="flex h-[252px] flex-shrink-0 flex-col items-center justify-center">
      <img src={EmptyPng} alt="empty" className="h-[64px] w-[64px]" />
      <p className="text-[12px] text-[#9397A3]">
        <Trans>No records found</Trans>
      </p>
    </div>
  )
}
