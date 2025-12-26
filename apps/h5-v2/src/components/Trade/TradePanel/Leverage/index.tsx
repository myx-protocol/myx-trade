import { Trans } from '@lingui/react/macro'
import { useLeverageDialogStore } from '../../Dialog/Leverage/store'
import { useLeverage } from '../../hooks/useLeverage'
import useGlobalStore from '@/store/globalStore'

export const Leverage = () => {
  const { symbolInfo } = useGlobalStore()
  const { open: openLeverageDialog } = useLeverageDialogStore()
  const leverage = useLeverage(symbolInfo?.poolId)
  return (
    <div
      className="ml-[4px] rounded-[6px] bg-[#18191F] px-[10px] py-[8px] text-[12px] font-medium text-[#CED1D9]"
      onClick={openLeverageDialog}
    >
      <Trans>{leverage}x</Trans>
    </div>
  )
}
