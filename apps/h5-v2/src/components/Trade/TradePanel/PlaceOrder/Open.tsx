import { DangerButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { useTradePanelStore } from '../store'
import { AmountUnitEnum } from '../../type'
import { displayAmount } from '@/utils/number'
import { parseBigNumber } from '@/utils/bn'
import { useMemo } from 'react'
import { useSubmitOrder } from './hooks/use-submit-order'
import { Direction } from '@myx-trade/sdk'
import useGlobalStore from '@/store/globalStore'
import { toast } from '@/components/UI/Toast'
import { t } from '@lingui/core/macro'
import { useGetOpenAvailable } from '@/hooks/available/use-get-open-available'

interface OpenPositionProps {
  showOrderSize?: boolean
}

export const OpenPosition = ({ showOrderSize = true }: OpenPositionProps) => {
  const { longSize, shortSize, amountUnit } = useTradePanelStore()
  const { maxOpenLong, maxOpenShort } = useGetOpenAvailable()
  const { symbolInfo } = useGlobalStore()
  const { submitOrder, submitLongLoading, submitShortLoading } = useSubmitOrder()
  const { showPlaceOrderConfirmDialog, setPlaceOrderConfirmDialogOpen } = useGlobalStore()

  const displayLongSize = useMemo(() => {
    if (!showOrderSize) return '0'
    if (parseBigNumber(longSize).eq(0)) {
      return '0'
    }
    return `${displayAmount(longSize)} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [longSize, amountUnit, symbolInfo, showOrderSize])

  const displayShortSize = useMemo(() => {
    if (!showOrderSize) return '0'
    if (parseBigNumber(shortSize).eq(0)) {
      return '0'
    }
    return `${displayAmount(shortSize)} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [shortSize, amountUnit, symbolInfo, showOrderSize])

  return (
    <div className="mt-[8px] flex w-[full] gap-[10px]">
      <PrimaryButton
        loading={submitLongLoading}
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
              title: t`open  amount must be greater than 0`,
            })
            return
          }

          const { baseAmount, quoteAmount } = maxOpenLong

          if (
            (amountUnit === AmountUnitEnum.BASE &&
              parseBigNumber(longSize).gt(parseBigNumber(baseAmount))) ||
            (amountUnit === AmountUnitEnum.QUOTE && parseBigNumber(longSize).gt(quoteAmount))
          ) {
            toast.error({
              title: `open size must be less than max size`,
            })
            return
          }

          if (showPlaceOrderConfirmDialog) {
            setPlaceOrderConfirmDialogOpen('LONG')
            return
          }
          submitOrder(Direction.LONG)
        }}
      >
        <div>
          <p>
            <Trans>Open Long</Trans>
          </p>
          {showOrderSize && parseBigNumber(longSize).gt(0) && (
            <p className="mt-[4px] text-[10px] leading-[16px] text-[rgba(255,255,255,0.80)]">
              {displayLongSize}
            </p>
          )}
        </div>
      </PrimaryButton>
      <DangerButton
        loading={submitShortLoading}
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
              title: t`open amount must be greater than 0`,
            })
            return
          }

          const { baseAmount, quoteAmount } = maxOpenShort

          if (
            (amountUnit === AmountUnitEnum.BASE &&
              parseBigNumber(shortSize).gt(parseBigNumber(baseAmount))) ||
            (amountUnit === AmountUnitEnum.QUOTE && parseBigNumber(shortSize).gt(quoteAmount))
          ) {
            toast.error({
              title: t`open size must be less than max size`,
            })
            return
          }

          if (showPlaceOrderConfirmDialog) {
            setPlaceOrderConfirmDialogOpen('SHORT')
            return
          }
          submitOrder(Direction.SHORT)
        }}
      >
        <div>
          <p>
            <Trans>Open Short</Trans>
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
