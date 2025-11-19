import { DangerButton, PrimaryButton } from '@/components/UI/Button'
import { Trans } from '@lingui/react/macro'
import { useTradePanelStore } from '../store'
import { AmountUnitEnum } from '../../type'
import { useTradePageStore } from '../../store/TradePageStore'
import { displayAmount } from '@/utils/number'
import { parseBigNumber } from '@/utils/bn'
import { useMemo } from 'react'
import { useSubmitOrder } from './hooks/use-submit-order'
import { Direction } from '@myx-trade/sdk'

export const OpenPosition = () => {
  const { longSize, shortSize, amountUnit } = useTradePanelStore()
  const { symbolInfo } = useTradePageStore()
  const { submitOrder } = useSubmitOrder()

  const displayLongSize = useMemo(() => {
    return `${displayAmount(longSize)} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [longSize, amountUnit, symbolInfo])

  const displayShortSize = useMemo(() => {
    return `${displayAmount(shortSize)} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [shortSize, amountUnit, symbolInfo])

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
        onClick={() => submitOrder(Direction.LONG)}
      >
        <div>
          <p>
            <Trans>Open Long</Trans>
          </p>
          {parseBigNumber(longSize).gt(0) && (
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
          submitOrder(Direction.SHORT)
        }}
      >
        <div>
          <p>
            <Trans>Open Short</Trans>
          </p>
          {parseBigNumber(shortSize).gt(0) && (
            <p className="mt-[4px] text-[10px] leading-[16px] text-[rgba(255,255,255,0.80)]">
              {displayShortSize}
            </p>
          )}
        </div>
      </DangerButton>
    </div>
  )
}
