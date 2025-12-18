import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { formatNumber } from '@/utils/number'
import { Trans } from '@lingui/react/macro'
import { DialogConfirmFooter } from '../components/DialogConfirmFooter'
import useGlobalStore from '@/store/globalStore'
import { useTradePageStore } from '../../store/TradePageStore'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { useTradePanelStore } from '../../TradePanel/store'
import { Direction, DirectionEnum, OrderTypeEnum } from '@myx-trade/sdk'
import { AmountUnitEnum, TpSlTypeEnum } from '../../type'
import { parseBigNumber } from '@/utils/bn'
import useSWR from 'swr'
import { useSubmitOrder } from '../../TradePanel/PlaceOrder/hooks/use-submit-order'
import { useEffect, useMemo, useState } from 'react'
import { t } from '@lingui/core/macro'
import { setSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { getSlippage } from '@/utils/slippage'
import { EditText } from '@/components/EditText'
import { useGetTradingFee } from '@/hooks/calculate/use-get-trading-fee'
import { useGetLiqPrice } from '@/hooks/calculate/use-get-liq-price'
import { tradePubSub } from '@/utils/pubsub'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'

export const PlaceOrderConfirmDialog = () => {
  const {
    placeOrderConfirmDialogOpen,
    setShowPlaceOrderConfirmDialog,
    setPlaceOrderConfirmDialogOpen,
  } = useGlobalStore()
  const { symbolInfo, poolConfig } = useTradePageStore()
  const leverage = useLeverage(symbolInfo?.poolId)
  const {
    price,
    longSize,
    shortSize,
    amountUnit,
    autoMarginMode,
    collateralAmount,
    tpValue,
    slValue,
    orderType,
    tpType,
    slType,
    tpSlOpen,
  } = useTradePanelStore()
  const direction = placeOrderConfirmDialogOpen === 'LONG' ? Direction.LONG : Direction.SHORT
  const { submitOrder, submitLoading } = useSubmitOrder()
  const { showPlaceOrderConfirmDialog, poolList } = useGlobalStore()
  const { getTradingFee } = useGetTradingFee(symbolInfo?.chainId)
  const assets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId)
  const { getLiqPrice } = useGetLiqPrice({
    poolId: symbolInfo?.poolId ?? '',
    chainId: symbolInfo?.chainId ?? 0,
  })
  const assetClass = poolConfig?.levelConfig?.assetClass ?? 0
  const maintainCollateralRate = poolConfig?.levelConfig?.maintainCollateralRate ?? 0
  const formatCollateralAmount = useMemo(() => {
    if (!autoMarginMode) {
      return collateralAmount
    }

    const size = direction === Direction.LONG ? longSize : shortSize
    if (amountUnit === AmountUnitEnum.QUOTE) {
      return parseBigNumber(size).div(leverage).toString()
    }
    return parseBigNumber(size).mul(parseBigNumber(price)).div(leverage).toString()
  }, [direction, longSize, shortSize, amountUnit, price, autoMarginMode, collateralAmount])

  const usedInfo = useMemo(() => {
    const freeMargin = parseBigNumber(assets?.freeMargin ?? '0')
    const profit = parseBigNumber(assets?.quoteProfit ?? '0')
    const accountTotal = freeMargin.plus(profit)
    let needAccount = parseBigNumber(0)
    let needWallet = parseBigNumber(0)
    if (parseBigNumber(accountTotal).gte(parseBigNumber(formatCollateralAmount))) {
      needAccount = parseBigNumber(formatCollateralAmount)
    } else {
      needAccount = parseBigNumber(accountTotal)
      needWallet = parseBigNumber(formatCollateralAmount).minus(accountTotal)
    }

    return {
      wallet: needWallet.toString(),
      account: needAccount.toString(),
    }
  }, [assets, formatCollateralAmount])

  const { data: liqPrice } = useSWR(
    symbolInfo?.poolId && symbolInfo?.chainId
      ? [
          'liq_price',
          symbolInfo.poolId,
          symbolInfo.chainId,
          direction === Direction.LONG ? longSize : shortSize,
          direction,
          formatCollateralAmount,
          price,
          assetClass,
          maintainCollateralRate.toString(),
        ]
      : null,
    async () => {
      const size = direction === Direction.LONG ? longSize : shortSize
      const formatSize =
        amountUnit === AmountUnitEnum.BASE
          ? size
          : parseBigNumber(size).div(parseBigNumber(price)).toString()
      const liqPrice = await getLiqPrice({
        entryPrice: price,
        collateralAmount: formatCollateralAmount,
        size: formatSize,
        price: price,
        assetClass: assetClass,
        fundingRateIndexEntry: '0',
        direction: direction,
        maintainMarginRate: maintainCollateralRate.toString(),
        needFundingFee: false,
      })

      return liqPrice
    },
    {
      keepPreviousData: true, // 保留之前的数据，避免闪烁
    },
  )
  const [openPositionSlippage, setOpenPositionSlippage] = useState(
    getSlippage({
      chainId: symbolInfo?.chainId ?? 0,
      poolId: symbolInfo?.poolId ?? '',
      type: SlippageTypeEnum.OPEN,
    }),
  )

  useEffect(() => {
    const updateSlippage = () => {
      setOpenPositionSlippage(
        getSlippage({
          chainId: symbolInfo?.chainId ?? 0,
          poolId: symbolInfo?.poolId ?? '',
          type: SlippageTypeEnum.OPEN,
        }),
      )
    }
    if (symbolInfo?.chainId && symbolInfo.poolId) {
      tradePubSub.on('trade:slippage:change', updateSlippage)
      return () => {
        tradePubSub.off('trade:slippage:change', updateSlippage)
      }
    }
  }, [symbolInfo?.chainId, symbolInfo?.poolId])

  const pool = useMemo(() => {
    return poolList.find((item: any) => item.poolId === symbolInfo?.poolId)
  }, [poolList, symbolInfo?.poolId])

  const { data: tradingFee } = useSWR(
    pool && symbolInfo?.chainId
      ? [
          'trading_fee',
          symbolInfo.poolId,
          symbolInfo.chainId,
          direction === Direction.LONG ? longSize : shortSize,
          price,
          pool.assetClass,
        ]
      : null,
    async () => {
      const size = direction === Direction.LONG ? longSize : shortSize
      const formatSize =
        amountUnit === AmountUnitEnum.BASE
          ? size
          : parseBigNumber(size).div(parseBigNumber(price)).toString()
      const fee = await getTradingFee({
        size: formatSize,
        price: price,
        assetClass: pool?.assetClass ?? 0,
      })
      return fee
    },
    {
      keepPreviousData: true, // 保留之前的数据，避免闪烁
    },
  )

  const entrustAmount = useMemo(() => {
    if (amountUnit === AmountUnitEnum.BASE) {
      return parseBigNumber(direction === Direction.LONG ? longSize : shortSize).toString()
    } else {
      if (parseBigNumber(price).eq(0)) {
        return '0'
      }

      return parseBigNumber(direction === Direction.LONG ? longSize : shortSize)
        .div(parseBigNumber(price))
        .toString()
    }
  }, [direction, longSize, shortSize, amountUnit, price])

  const tpInfo = useMemo(() => {
    if (!tpValue || parseBigNumber(tpValue).eq(0) || parseBigNumber(price).eq(0)) {
      return {
        pnl: '0',
        price: '0',
      }
    }
    let formatTpPrice = tpValue.toString()
    const originSize = direction === DirectionEnum.Long ? longSize : shortSize
    const safePrice = price ?? '1'
    const formatTpSize =
      amountUnit === AmountUnitEnum.BASE
        ? originSize
        : parseBigNumber(originSize).div(parseBigNumber(safePrice)).toString()
    let pnl = '0'

    if (tpValue && !parseBigNumber(tpValue).eq(0)) {
      const useCollateralAmount = !autoMarginMode
        ? collateralAmount
        : parseBigNumber(formatTpSize).mul(parseBigNumber(price)).div(leverage).toString()

      if (tpType === TpSlTypeEnum.Change) {
        const radio = parseBigNumber(1).plus(
          parseBigNumber(tpValue)
            .div(100)
            .mul(direction === Direction.LONG ? 1 : -1),
        )
        formatTpPrice = parseBigNumber(price).mul(radio).toString()
      } else if (tpType === TpSlTypeEnum.ROI) {
        const radio = parseBigNumber(tpValue).div(100)
        const totalPnl = parseBigNumber(useCollateralAmount).mul(radio)
        const averagePnl = totalPnl.div(parseBigNumber(formatTpSize))
        const targetPrice = parseBigNumber(price).plus(
          direction === Direction.LONG ? averagePnl : averagePnl.mul(-1),
        )
        formatTpPrice = targetPrice.toString()
      } else if (tpType === TpSlTypeEnum.Pnl) {
        const totalPnl = parseBigNumber(tpValue)
        const averagePnl = totalPnl.div(parseBigNumber(formatTpSize))
        if (direction === Direction.LONG) {
          const targetPrice = parseBigNumber(price).plus(averagePnl)
          formatTpPrice = targetPrice.toString()
        } else {
          const targetPrice = parseBigNumber(price).minus(averagePnl)
          formatTpPrice = targetPrice.toString()
        }
      }
    }

    if (direction === Direction.LONG) {
      pnl = parseBigNumber(formatTpPrice)
        .minus(parseBigNumber(price))
        .mul(parseBigNumber(formatTpSize))
        .toString()
    } else {
      pnl = parseBigNumber(price)
        .minus(parseBigNumber(formatTpPrice))
        .mul(parseBigNumber(formatTpSize))
        .toString()
    }

    return {
      pnl,
      price: formatTpPrice,
    }
  }, [tpValue, price, direction, longSize, shortSize, autoMarginMode])

  const slInfo = useMemo(() => {
    if (!slValue || parseBigNumber(slValue).eq(0) || parseBigNumber(price).eq(0)) {
      return {
        pnl: '0',
        price: '0',
      }
    }
    let formatSlPrice = slValue.toString()
    const safePrice = price ?? '1'
    const originSize = direction === DirectionEnum.Long ? longSize : shortSize
    const formatSlSize =
      amountUnit === AmountUnitEnum.BASE
        ? originSize
        : parseBigNumber(originSize).div(parseBigNumber(safePrice)).toString()
    let pnl = '0'

    if (slValue && !parseBigNumber(slValue).eq(0)) {
      const useCollateralAmount = !autoMarginMode
        ? collateralAmount
        : parseBigNumber(formatSlSize).mul(parseBigNumber(price)).div(leverage).toString()
      if (slType === TpSlTypeEnum.Change) {
        const radio = parseBigNumber(1).plus(
          parseBigNumber(slValue)
            .div(100)
            .mul(direction === Direction.LONG ? -1 : 1),
        )
        formatSlPrice = parseBigNumber(price).mul(radio).toString()
      } else if (slType === TpSlTypeEnum.ROI) {
        const radio = parseBigNumber(slValue).div(100)
        const totalPnl = parseBigNumber(useCollateralAmount).mul(radio)
        const averagePnl = totalPnl.div(parseBigNumber(formatSlSize))
        const targetPrice = parseBigNumber(price).plus(
          direction === Direction.LONG ? averagePnl.mul(-1) : averagePnl,
        )
        formatSlPrice = targetPrice.toString()
      } else if (slType === TpSlTypeEnum.Pnl) {
        const totalPnl = parseBigNumber(slValue)
        const averagePnl = totalPnl.div(parseBigNumber(formatSlSize))
        if (direction === Direction.LONG) {
          const targetPrice = parseBigNumber(price).minus(averagePnl)
          formatSlPrice = targetPrice.toString()
        } else {
          const targetPrice = parseBigNumber(price).plus(averagePnl)
          formatSlPrice = targetPrice.toString()
        }
      }
    }

    if (direction === Direction.LONG) {
      pnl = parseBigNumber(formatSlPrice)
        .minus(parseBigNumber(price))
        .mul(parseBigNumber(formatSlSize))
        .toString()
    } else {
      pnl = parseBigNumber(price)
        .minus(parseBigNumber(formatSlPrice))
        .mul(parseBigNumber(formatSlSize))
        .toString()
    }

    return {
      pnl,
      price: formatSlPrice,
    }
  }, [slValue, price, direction, longSize, shortSize, autoMarginMode])

  return (
    <DialogTheme
      open={!!placeOrderConfirmDialogOpen}
      onClose={() => setPlaceOrderConfirmDialogOpen(false)}
    >
      <DialogTitleTheme
        onClose={() => setPlaceOrderConfirmDialogOpen(false)}
        className="pb-[20px]!"
      >
        <div className="leading-[1]">
          <p className="text-[20px] leading-[1] font-bold text-[white]">
            <Trans>{direction === Direction.LONG ? 'Open Long' : 'Open Short'}</Trans>
          </p>
          <p
            className="mt-[6px] text-[14px] font-bold"
            style={{ color: direction === Direction.LONG ? '#00E3A5' : '#EC605A' }}
          >
            <span>
              {symbolInfo?.baseSymbol}
              {symbolInfo?.quoteSymbol}
            </span>
            <span className="ml-[4px]">{leverage}x</span>
          </p>
        </div>
      </DialogTitleTheme>
      <div className="px-[20px] pb-[24px]">
        {/* order info  */}
        <div className="rounded-[12px] bg-[#202129] px-[12px] py-[20px] text-[14px] leading-[1] font-medium text-[#CED1D9]">
          {/* top */}
          <div className="flex flex-col gap-[16px] border-b-[1px] border-[#31333D] pb-[20px]">
            <FlexRowLayout
              left={<Trans>委托价格</Trans>}
              right={
                <p className="font-bold text-white">
                  {orderType === OrderTypeEnum.Market ? (
                    t`Market Price`
                  ) : (
                    <>
                      {formatNumber(price, {
                        showUnit: false,
                      })}{' '}
                      {symbolInfo?.quoteSymbol}
                    </>
                  )}
                </p>
              }
            />
            <FlexRowLayout
              left={<Trans>委托数量</Trans>}
              right={
                <p className="font-bold text-white">
                  {formatNumber(entrustAmount, {
                    showUnit: false,
                  })}
                  <span className="ml-[2px]">{symbolInfo?.baseSymbol}</span>
                </p>
              }
            />
            <FlexRowLayout
              left={<Trans>交易手续费</Trans>}
              right={
                <p className="font-bold text-white">
                  {formatNumber(tradingFee ?? '0', {
                    showUnit: false,
                  })}
                  <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
                </p>
              }
            />
            <FlexRowLayout
              left={<Trans>强平价</Trans>}
              right={
                parseBigNumber(liqPrice ?? '0').eq(0) ? (
                  <p className="font-bold text-[#F29D39]">--</p>
                ) : (
                  <p className="font-bold text-[#F29D39]">
                    {formatNumber(liqPrice ?? '0', {
                      showUnit: false,
                    })}
                    <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
                  </p>
                )
              }
            />
          </div>
          {/* bottom */}
          <div className="pt-[20px]">
            {/* title */}
            <FlexRowLayout
              left={<Trans>保证金</Trans>}
              right={
                <p className="font-bold text-white">
                  {formatNumber(formatCollateralAmount ?? '0', {
                    showUnit: false,
                  })}
                  <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
                </p>
              }
            />
            {/* value */}
            <FlexRowLayout
              className="mt-[16px] text-[12px] font-normal text-[#9397A3]"
              left={<Trans>从钱包</Trans>}
              right={
                <p className="font-semibold text-white">
                  {formatNumber(usedInfo.wallet, {
                    showUnit: false,
                  })}
                  <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
                </p>
              }
            />
            {/* value */}
            <FlexRowLayout
              className="mt-[10px] text-[12px] font-normal text-[#9397A3]"
              left={<Trans>从保证金账户</Trans>}
              right={
                <p className="font-semibold text-white">
                  {' '}
                  {formatNumber(usedInfo.account, {
                    showUnit: false,
                  })}
                  <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
                </p>
              }
            />
          </div>
        </div>
        {/* tpsl */}
        {tpSlOpen && (
          <div className="mt-[20px] flex flex-col gap-[10px] border-b-[1px] border-[#31333D] pb-[20px] text-[12px] leading-[1] font-normal text-[#9397A3]">
            {!!(tpValue && !parseBigNumber(tpValue).eq(0)) && (
              <>
                <FlexRowLayout
                  left={t`TP(${orderType === OrderTypeEnum.Market ? `Market` : `Limit`})`}
                  right={
                    <p className="font-medium text-white">
                      {formatNumber(tpInfo.price, { showUnit: false })} {symbolInfo?.quoteSymbol} /
                      {direction === Direction.LONG
                        ? formatNumber(longSize, { showUnit: false })
                        : formatNumber(shortSize, { showUnit: false })}{' '}
                      {symbolInfo?.baseSymbol}
                    </p>
                  }
                />
                <FlexRowLayout
                  left={t`TP Est. PNL`}
                  right={
                    <p className="text-green font-medium">
                      {formatNumber(tpInfo?.pnl?.toString(), { showUnit: false, showSign: true })}
                      <span className="ml-[2px]">{symbolInfo?.quoteSymbol}</span>
                    </p>
                  }
                />
              </>
            )}
            {!!(slValue && !parseBigNumber(slValue).eq(0)) && (
              <>
                <FlexRowLayout
                  left={t`SL(${orderType === OrderTypeEnum.Market ? `Market` : `Limit`})`}
                  right={
                    <p className="font-medium text-white">
                      {formatNumber(slInfo.price, { showUnit: false })} {symbolInfo?.quoteSymbol} /
                      {direction === Direction.LONG
                        ? formatNumber(longSize, { showUnit: false })
                        : formatNumber(shortSize, { showUnit: false })}{' '}
                      {symbolInfo?.baseSymbol}
                    </p>
                  }
                />
                <FlexRowLayout
                  left={t`SL Est. PNL`}
                  right={
                    <p className="text-fall font-medium">
                      {!parseBigNumber(slInfo?.pnl).eq(0)
                        ? `${formatNumber(slInfo?.pnl?.toString(), { showUnit: false })} ${symbolInfo?.quoteSymbol}`
                        : '--'}
                    </p>
                  }
                />
              </>
            )}
          </div>
        )}
        <div className="mt-[20px] text-[12px] font-normal text-[#848E9C]">
          <FlexRowLayout
            left={<Trans>滑点</Trans>}
            right={
              <EditText
                value={`${((openPositionSlippage ?? 0) * 100).toFixed(2)}`}
                unit="%"
                onChange={(newSlippage, closeEdit) => {
                  setSlippage({
                    chainId: symbolInfo?.chainId ?? 0,
                    poolId: symbolInfo?.poolId ?? '',
                    type: SlippageTypeEnum.OPEN,
                    slippage: parseBigNumber(newSlippage).div(100).toNumber(),
                  })
                  tradePubSub.emit('trade:slippage:change', {
                    chainId: symbolInfo?.chainId ?? 0,
                    poolId: symbolInfo?.poolId ?? '',
                  })
                  closeEdit?.()
                }}
              />
            }
          />
        </div>
        <div className="mt-[20px]">
          <DialogConfirmFooter
            loading={submitLoading}
            onConfirm={() => {
              submitOrder(placeOrderConfirmDialogOpen === 'LONG' ? Direction.LONG : Direction.SHORT)
            }}
            showDontShowAgain={!showPlaceOrderConfirmDialog}
            setDontShowAgain={(show) => setShowPlaceOrderConfirmDialog(show)}
          />
        </div>
      </div>
    </DialogTheme>
  )
}
