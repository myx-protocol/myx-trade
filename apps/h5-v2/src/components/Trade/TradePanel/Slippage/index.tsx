import { Trans } from '@lingui/react/macro'
import EditSimply from '@/components/Icon/set/EditSimply'
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
      <div className="mt-[20px] flex gap-[4px] text-[14px] leading-[1] font-medium">
        <p className="text-[#848E9C]">
          <Trans>Slippage</Trans>
        </p>
        <p className="text-[#CED1D9]">
          {direction === PositionActionEnum.OPEN
            ? openPositionSlippage * 100
            : closePositionSlippage * 100}
          %
        </p>
        <span role="button" className="flex" onClick={() => setOpen(true)}>
          <EditSimply size={12} color="#CED1D9" />
        </span>
      </div>
      <SlippageDialog
        defaultSlippage={defaultSlippage}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
