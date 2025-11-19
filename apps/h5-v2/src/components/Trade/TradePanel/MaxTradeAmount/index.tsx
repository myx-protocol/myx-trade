import { Tooltips } from '@/components/UI/Tooltips'
import { displayAmount } from '@/utils/number'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useGetOpenAvailable } from '@/hooks/available/use-get-open-available'
import { useTradePageStore } from '../../store/TradePageStore'
import { useTradePanelStore } from '../store'
import { AmountUnitEnum, PositionActionEnum } from '../../type'
import { useMemo } from 'react'
import { useGetCloseAvailable } from '@/hooks/available/use-get-close-available'

export const MaxTradeAmount = () => {
  const { maxOpenLong, maxOpenShort } = useGetOpenAvailable()
  const { maxCloseLong, maxCloseShort } = useGetCloseAvailable()
  const { amountUnit, positionAction } = useTradePanelStore()
  const { symbolInfo } = useTradePageStore()

  const maxOpenAmount = useMemo(() => {
    if (positionAction === PositionActionEnum.OPEN) {
      const amount =
        amountUnit === AmountUnitEnum.BASE ? maxOpenLong.baseAmount : maxOpenLong.quoteAmount

      return displayAmount(amount)
    } else {
      return displayAmount(
        amountUnit === AmountUnitEnum.BASE ? maxCloseLong.baseAmount : maxCloseLong.quoteAmount,
      )
    }
  }, [amountUnit, maxOpenLong, symbolInfo, positionAction])

  const maxOpenShortAmount = useMemo(() => {
    if (positionAction === PositionActionEnum.OPEN) {
      const amount =
        amountUnit === AmountUnitEnum.BASE ? maxOpenShort.baseAmount : maxOpenShort.quoteAmount

      return displayAmount(amount)
    } else {
      return displayAmount(
        amountUnit === AmountUnitEnum.BASE ? maxCloseShort.baseAmount : maxCloseShort.quoteAmount,
      )
    }
  }, [amountUnit, maxOpenShort, symbolInfo, positionAction])

  return (
    <div className="mt-[12px] flex justify-between gap-[12px] text-[12px] leading-[1] font-medium text-white">
      <div className="flex w-full min-w-0 gap-[4px]">
        <Tooltips title={t`Max tooltips`}>
          <p className="flex-shrink-0 border-b-[1px] border-dashed border-[#848E9C] font-normal text-[#848E9C]">
            <Trans>Max</Trans>
          </p>
        </Tooltips>
        <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{maxOpenAmount}</p>
      </div>
      <div className="flex w-full min-w-0 justify-end gap-[4px]">
        <Tooltips title={t`Max tooltips`}>
          <p className="flex-shrink-0 border-b-[1px] border-dashed border-[#848E9C] font-normal text-[#848E9C]">
            <Trans>Max</Trans>
          </p>
        </Tooltips>
        <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
          {maxOpenShortAmount}
        </p>
      </div>
    </div>
  )
}
