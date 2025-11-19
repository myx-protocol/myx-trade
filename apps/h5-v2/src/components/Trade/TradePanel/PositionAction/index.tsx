import { Trans } from '@lingui/react/macro'
import { PositionActionEnum } from '../../type'
import { useTradePanelStore } from '../store'
import type { PropsWithChildren } from 'react'

const PositionActionButton = ({
  children,
  value,
}: PropsWithChildren & {
  value: PositionActionEnum
}) => {
  const { positionAction, setPositionAction } = useTradePanelStore()
  return (
    <div
      className={`w-[50%] p-[12px] text-center text-[12px] leading-[1] font-medium ${positionAction === value ? 'text-[#FFFFFF]' : 'text-[#848E9C]'}`}
      role="button"
      onClick={() => setPositionAction(value)}
    >
      {children}
    </div>
  )
}

export const PositionAction = () => {
  const { positionAction } = useTradePanelStore()
  return (
    <div className="relative mt-[8px] h-[36px] rounded-[8px] bg-[#202129]">
      {/* indicator */}
      <div
        className="absolute top-0 h-full w-[50%] rounded-[6px] bg-[#008C66] transition-all duration-200 ease-in-out"
        style={{
          left: positionAction === PositionActionEnum.OPEN ? '0%' : '50%',
        }}
      ></div>
      {/* tabs */}
      <div className="absolute top-0 left-0 flex h-full w-full">
        <PositionActionButton value={PositionActionEnum.OPEN}>
          <Trans>Open</Trans>
        </PositionActionButton>
        <PositionActionButton value={PositionActionEnum.CLOSE}>
          <Trans>Close</Trans>
        </PositionActionButton>
      </div>
    </div>
  )
}
