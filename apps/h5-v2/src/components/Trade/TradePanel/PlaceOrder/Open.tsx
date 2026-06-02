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
import { usePoolNoTradable } from '@/hooks/pool/usePoolNoTradable'

interface OpenPositionProps {
  showOrderSize?: boolean
}

export const OpenPosition = ({ showOrderSize = true }: OpenPositionProps) => {
  const { longSize, shortSize, amountUnit, price } = useTradePanelStore()
  const { maxOpenLong, maxOpenShort } = useGetOpenAvailable()
  const { symbolInfo, poolConfig } = useGlobalStore()
  const {
    submitOrder,
    submitLoadingLong,
    submitLoadingShort,
    longAsyncVipLoading,
    shortAsyncVipLoading,
  } = useSubmitOrder()
  const { showPlaceOrderConfirmDialog, setPlaceOrderConfirmDialogOpen } = useGlobalStore()
  const minOrderSizeInUsd = parseBigNumber(poolConfig?.levelConfig?.minOrderSizeInUsd ?? 0)
  const safePrice = parseBigNumber(price ?? '1').eq(0) ? parseBigNumber('1') : parseBigNumber(price)

  const minOrderSize = minOrderSizeInUsd.div(parseBigNumber(safePrice))
  const displayLongSize = useMemo(() => {
    if (!showOrderSize) return '0'
    if (parseBigNumber(longSize).eq(0)) {
      return '0'
    }

    if (amountUnit === AmountUnitEnum.BASE) {
      if (parseBigNumber(longSize).gt(parseBigNumber(maxOpenLong.baseAmount))) {
        return `${displayAmount(maxOpenLong.baseAmount)} ${symbolInfo?.baseSymbol}`
      }
    } else {
      if (parseBigNumber(longSize).gt(parseBigNumber(maxOpenLong.quoteAmount))) {
        return `${displayAmount(maxOpenLong.quoteAmount)} ${symbolInfo?.quoteSymbol}`
      }
    }

    return `${displayAmount(longSize)} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [longSize, amountUnit, symbolInfo, showOrderSize])

  const displayShortSize = useMemo(() => {
    if (!showOrderSize) return '0'
    if (parseBigNumber(shortSize).eq(0)) {
      return '0'
    }

    if (amountUnit === AmountUnitEnum.BASE) {
      if (parseBigNumber(shortSize).gt(parseBigNumber(maxOpenShort.baseAmount))) {
        return `${displayAmount(maxOpenShort.baseAmount)} ${symbolInfo?.baseSymbol}`
      }
    } else {
      if (parseBigNumber(shortSize).gt(parseBigNumber(maxOpenShort.quoteAmount))) {
        return `${displayAmount(maxOpenShort.quoteAmount)} ${symbolInfo?.quoteSymbol}`
      }
    }

    return `${displayAmount(shortSize)} ${amountUnit === AmountUnitEnum.BASE ? symbolInfo?.baseSymbol : symbolInfo?.quoteSymbol}`
  }, [shortSize, amountUnit, symbolInfo, showOrderSize])

  const { isNoTradable } = usePoolNoTradable({
    poolId: symbolInfo?.poolId,
    chainId: symbolInfo?.chainId,
  })

  return (
    <div className="mt-[8px] flex w-[full] gap-[10px]">
      <PrimaryButton
        loading={submitLoadingLong || longAsyncVipLoading}
        className="w-full"
        style={{
          fontSize: '13px',
          fontWeight: 'bold',
          padding: '14.5px 12px',
          lineHeight: 1,
          borderRadius: '8px',
          height: '44px',
          background: isNoTradable
            ? '#2D3138'
            : 'linear-gradient(135deg, #3D996B 0%, #00996F 100%)',
          backgroundImage: isNoTradable
            ? 'none'
            : 'linear-gradient(135deg, #3D996B 0%, #00996F 100%), linear-gradient(135deg, #80FF9580 0%, #00E5A780 100%)',
          color: isNoTradable ? 'rgba(255,255,255,0.15) !important' : 'white',
        }}
        disabled={isNoTradable}
        onClick={() => {
          if (isNoTradable) {
            return
          }
          if (parseBigNumber(longSize).lte(0)) {
            toast.error({
              title: t`open amount must be greater than 0 ${amountUnit === AmountUnitEnum.BASE ? (symbolInfo?.baseSymbol ?? '') : (symbolInfo?.quoteSymbol ?? '')}`,
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

          const minSize = amountUnit === AmountUnitEnum.BASE ? minOrderSize : minOrderSizeInUsd

          if (parseBigNumber(longSize).lt(minSize)) {
            toast.error({
              title: t`Order size must be greater than the minimum required`,
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
          {submitLoadingLong ? (
            <Trans>Confirming</Trans>
          ) : longAsyncVipLoading ? (
            <Trans>Update VIP</Trans>
          ) : (
            <p>
              <Trans>Open Long</Trans>
            </p>
          )}
          {showOrderSize && parseBigNumber(longSize).gt(0) && (
            <p className="mt-[4px] text-[10px] leading-[16px] text-[rgba(255,255,255,0.80)]">
              {displayLongSize}
            </p>
          )}
        </div>
      </PrimaryButton>
      <DangerButton
        loading={submitLoadingShort || shortAsyncVipLoading}
        className="w-full"
        style={{
          fontSize: '13px',
          fontWeight: 'bold',
          padding: '14.5px 12px',
          lineHeight: 1,
          borderRadius: '8px',
          height: '44px',
          background: isNoTradable
            ? '#2D3138'
            : 'linear-gradient(135deg, #C23749 0%, #BA4C47 100%)',
          backgroundImage: isNoTradable
            ? 'none'
            : 'linear-gradient(135deg, #C23749 0%, #BA4C47 81.25%), linear-gradient(135deg, #F6627680 0%, #EC645E80 100%)',
          color: isNoTradable ? 'rgba(255,255,255,0.15) !important' : 'white',
        }}
        disabled={isNoTradable}
        onClick={() => {
          if (isNoTradable) {
            return
          }
          if (parseBigNumber(shortSize).lte(0)) {
            toast.error({
              title: t`open amount must be greater than 0 ${amountUnit === AmountUnitEnum.BASE ? (symbolInfo?.baseSymbol ?? '') : (symbolInfo?.quoteSymbol ?? '')}`,
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

          const minSize = amountUnit === AmountUnitEnum.BASE ? minOrderSize : minOrderSizeInUsd

          if (parseBigNumber(shortSize).lt(minSize)) {
            toast.error({
              title: t`Order size must be greater than the minimum required`,
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
          {submitLoadingShort ? (
            <Trans>Confirming</Trans>
          ) : shortAsyncVipLoading ? (
            <Trans>Update VIP</Trans>
          ) : (
            <p>
              <Trans>Open Short</Trans>
            </p>
          )}
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
