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
      className="ml-[4px] rounded-[6px] bg-[#18191F] px-[10px] py-[8px] text-[12px] font-medium text-[#848E9C]"
      onClick={openLeverageDialog}
    >
      <Trans>{leverage}x</Trans>
    </div>
  )
}
