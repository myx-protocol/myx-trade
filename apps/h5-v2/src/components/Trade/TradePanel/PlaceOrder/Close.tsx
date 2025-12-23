import { DangerButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { useTradePanelStore } from '../store'
import { useTradePageStore } from '../../store/TradePageStore'
import { useSubmitOrder } from './hooks/use-submit-order'
import { useMemo } from 'react'
import { displayAmount } from '@/utils/number'
import { AmountUnitEnum } from '../../type'
import { parseBigNumber } from '@/utils/bn'
import { Direction } from '@myx-trade/sdk'
import useGlobalStore from '@/store/globalStore'
import { t } from '@lingui/core/macro'
import { toast } from '@/components/UI/Toast'
import { useGetCloseAvailable } from '@/hooks/available/use-get-close-available'

interface ClosePositionProps {
  showOrderSize?: boolean
}

export const ClosePosition = ({ showOrderSize = true }: ClosePositionProps) => {
  const { shortSize, longSize, amountUnit } = useTradePanelStore()
  const { maxCloseLong, maxCloseShort } = useGetCloseAvailable()
  const { symbolInfo } = useTradePageStore()
  const { submitOrder } = useSubmitOrder()
  const { showCloseOrderConfirmDialog, setCloseOrderConfirmDialogOpen } = useGlobalStore()
  const displayLongSize = useMemo(() => {
    if (!showOrderSize) return '0'
    return `${displayAmount(longSize ?? '0')} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [longSize, amountUnit, symbolInfo, showOrderSize])

  const displayShortSize = useMemo(() => {
    if (!showOrderSize) return '0'
    return `${displayAmount(shortSize ?? '0')} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [shortSize, amountUnit, symbolInfo, showOrderSize])

  return (
    <div className="mt-[8px] flex w-[full] gap-[10px]">
      <PrimaryButton
        className="w-full"
        style={{
          fontSize: '13px',
          fontWeight: 'bold',
          padding: '14.5px 12px',
          lineHeight: 1,
          borderRadius: '8px',
          height: '44px',
        }}
        onClick={() => {
          if (parseBigNumber(longSize).lte(0)) {
            toast.error({
              title: t`close  amount must be greater than 0`,
            })
            return
          }

          if (parseBigNumber(longSize).gt(parseBigNumber(maxCloseLong.quoteAmount))) {
            toast.error({
              title: t`close amount must be less than ${displayAmount(maxCloseLong.quoteAmount)}`,
            })
            return
          }

          if (showCloseOrderConfirmDialog) {
            setCloseOrderConfirmDialogOpen('LONG')
            return
          }
          submitOrder(Direction.LONG)
        }}
      >
        <div>
          <p>
            <Trans>Close Long</Trans>
          </p>
          {showOrderSize && parseBigNumber(longSize).gt(0) && (
            <p className="mt-[4px] text-[10px] leading-[16px] text-[rgba(255,255,255,0.80)]">
              {displayLongSize}
            </p>
          )}
        </div>
      </PrimaryButton>
      <DangerButton
        className="w-full"
        style={{
          fontSize: '13px',
          fontWeight: 'bold',
          padding: '14.5px 12px',
          lineHeight: 1,
          borderRadius: '8px',
          height: '44px',
        }}
        onClick={() => {
          if (parseBigNumber(shortSize).lte(0)) {
            toast.error({
              title: t`close  amount must be greater than 0`,
            })
            return
          }
          if (parseBigNumber(shortSize).gt(parseBigNumber(maxCloseShort.quoteAmount))) {
            toast.error({
              title: t`close  amount must be less than ${displayAmount(maxCloseShort.quoteAmount)}`,
            })
            return
          }

          if (showCloseOrderConfirmDialog) {
            setCloseOrderConfirmDialogOpen('SHORT')
            return
          }
          submitOrder(Direction.SHORT)
        }}
      >
        <div>
          <p>
            <Trans>Close Short</Trans>
          </p>
          {showOrderSize && parseBigNumber(shortSize).gt(0) && (
            <p className="mt-[4px] text-[10px] leading-[16px] text-[rgba(255,255,255,0.80)]">
              {displayShortSize}
            </p>
          )}
        </div>
      </DangerButton>
    </div>
  )
}
