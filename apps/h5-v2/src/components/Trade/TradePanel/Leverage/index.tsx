import { Trans } from '@lingui/react/macro'
import { useLeverageDialogStore } from '../../Dialog/Leverage/store'
import { useLeverage } from '../../hooks/useLeverage'
import { useTradePageStore } from '../../store/TradePageStore'

export const Leverage = () => {
  const { symbolInfo } = useTradePageStore()
  const { open: openLeverageDialog } = useLeverageDialogStore()
  const leverage = useLeverage(symbolInfo?.poolId)
  return (
    <div
      className="flex flex-shrink-0 flex-grow-1 items-center justify-center rounded-[6px] bg-[#18191F] px-[16px] py-[8px] text-[12px] leading-[1] font-medium text-[#CED1D9]"
      role="button"
      onClick={openLeverageDialog}
    >
      <Trans>{leverage}x</Trans>
    </div>
  )
}
