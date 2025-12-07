import { SlippageDialog } from '../../Dialog/Slippage'
import { useState } from 'react'
import { useTradePanelStore } from '../store'
import { PositionActionEnum } from '../../type'

export const Slippage = ({
  defaultSlippage,
  direction,
}: {
  defaultSlippage: number
  direction: PositionActionEnum
}) => {
  const [open, setOpen] = useState(false)
  const { openPositionSlippage, closePositionSlippage } = useTradePanelStore()
  return (
    <>
      <div
        className="ml-[4px] cursor-pointer rounded-[6px] bg-[#18191F] px-[10px] py-[8px] text-[12px] font-medium text-[#848E9C]"
        onClick={() => setOpen(true)}
      >
        <p className="text-[#CED1D9]">
          {direction === PositionActionEnum.OPEN
            ? openPositionSlippage * 100
            : closePositionSlippage * 100}
          %
        </p>
      </div>
      <SlippageDialog
        defaultSlippage={defaultSlippage}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
