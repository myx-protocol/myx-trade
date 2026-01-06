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
  const {
    positionAction,
    setPositionAction,
    setTempInputValue,
    setLongSize,
    setShortSize,
    setAmountSliderValue,
  } = useTradePanelStore()
  return (
    <div
      className={`w-[calc(50%-6px)] p-[12px] text-center text-[12px] ${positionAction === value ? 'bg-[transparent]' : 'bg-[#18191F]'} leading-[1] font-medium ${positionAction === value ? 'text-[#FFFFFF]' : 'text-[#848E9C]'}`}
      role="button"
      style={{
        clipPath:
          value === PositionActionEnum.OPEN
            ? 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
            : 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)',
        borderTopLeftRadius: value === PositionActionEnum.OPEN ? '16px' : '0px',
        borderBottomLeftRadius: value === PositionActionEnum.OPEN ? '16px' : '0px',
        borderTopRightRadius: value === PositionActionEnum.OPEN ? '0px' : '16px',
        borderBottomRightRadius: value === PositionActionEnum.OPEN ? '0px' : '16px',
      }}
      onClick={() => {
        setPositionAction(value)
        setTempInputValue('')
        setLongSize('0')
        setShortSize('0')
        setAmountSliderValue(0)
      }}
    >
      {children}
    </div>
  )
}

export const PositionAction = () => {
  const { positionAction } = useTradePanelStore()
  const isOpen = positionAction === PositionActionEnum.OPEN

  // Open: 左边圆角，右边倒梯形斜边（上底长下底短：顶部到100%，底部到calc(100% - 12px)）
  const openClipPath = 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)'
  // Close: 左边倒梯形斜边（上底长下底短：顶部从12px开始，底部从0开始），右边圆角
  const closeClipPath = 'polygon(12px 0, 100% 0, 100% 100%, 0 100%)'

  //bg-[#202129]
  return (
    <div className="relative mt-[8px] h-[36px] rounded-[16px]">
      {/* indicator */}
      <div
        className="absolute top-0 h-full w-[50%] transition-all duration-200 ease-in-out"
        style={{
          left: isOpen ? '0%' : '50%',
          borderTopLeftRadius: isOpen ? '16px' : '0px',
          borderBottomLeftRadius: isOpen ? '16px' : '0px',
          borderTopRightRadius: isOpen ? '0px' : '16px',
          borderBottomRightRadius: isOpen ? '0px' : '16px',
          clipPath: isOpen ? openClipPath : closeClipPath,
          backgroundColor: isOpen ? '#008C66' : '#BA4C47',
        }}
      ></div>
      {/* tabs */}
      <div className="absolute top-0 left-0 flex h-full w-full justify-between gap-[12px]">
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
