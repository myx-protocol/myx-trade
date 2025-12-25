import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { Chart } from '../Chart'
import { useEffect, useMemo, useState } from 'react'
import { TabType } from '@/pages/Trade/types'
import { Trans } from '@lingui/react/macro'
import { Record, SortDown, WalletLine } from '@/components/Icon'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols'
import { InfoButton } from '@/components/UI/Button'
import { useNavigate } from 'react-router-dom'
import { Slippage } from '@/components/Trade/TradePanel/Slippage'
import { AmountUnitEnum, PositionActionEnum } from '@/components/Trade/type'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { getSlippageConfig } from '@/utils/slippage'
import { OrderType, type MarketDetailResponse } from '@myx-trade/sdk'
import { useLeverageDialogStore } from '@/components/Trade/Dialog/Leverage/store'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { AssetsDialogButton } from '@/components/Trade/TradePanel/BalanceAndMarginMode'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import { displayAmount, formatNumberWithBaseToken } from '@/utils/number'
import useGlobalStore from '@/store/globalStore'
import ToTrade from '@/components/Icon/set/ToTrade'
import { AmountInput } from './AmountInput'
import { LeverageDialog } from '@/components/Trade/Dialog/Leverage/Leverage'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { usePositionStore } from '@/store/position/createStore'
import { PositionList } from '@/pages/record/components/PositionList'
import { OpenOrderList } from '@/pages/record/components/OpenOrderList'
import { CloseAllPositionDialog } from '@/pages/Trade/components/CloseAllPositionDialog'
import { CancelAllOrdersDialog } from '@/pages/Trade/components/CancelAllOrdersDialog'
import { CanSwitchWalletNetwork } from '@/components/CanSwitchWalletNetwork'
import { PlaceOrder } from '@/components/Trade/TradePanel/PlaceOrder'
import { useMount } from 'ahooks'
import { useTradePanelStore } from '@/components/Trade/TradePanel/store'
import { parseBigNumber } from '@/utils/bn'
import { useGetOpenAvailable } from '@/hooks/available/use-get-open-available'
import { CloseConfirmDialog } from '@/components/CloseConfirmDialog'
import { PlaceOrderConfirmDialog } from '@/components/PlaceOrderConfirm'
import { useMarketStore } from '@/components/Trade/store/MarketStore'

export const PriceContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITION)
  const { closeOrderConfirmDialogOpen, placeOrderConfirmDialogOpen } = useGlobalStore()
  const {
    hideOthersSymbols,
    setHideOthersSymbols,
    setCloseAllPositionDialogOpen,
    setCancelAllOrdersDialogOpen,
    closeAllPositionDialogOpen,
    cancelAllOrdersDialogOpen,
  } = usePositionStore()

  const { open: openLeverageDialog } = useLeverageDialogStore()
  const { symbolInfo } = useGlobalStore()
  const accountAssets = useGetAccountAssets(symbolInfo?.chainId, symbolInfo?.poolId as string)
  const leverage = useLeverage(symbolInfo?.poolId)

  const { poolConfig } = useGetPoolConfig(
    symbolInfo?.poolId as string,
    symbolInfo?.chainId as number,
  )
  const defaultSlippage = useMemo(() => {
    return getSlippageConfig(poolConfig?.level ?? 1)
  }, [poolConfig?.level])

  const navigate = useNavigate()

  const orderList = useGetOrderList(true)
  const positionList = useGetPositionList(true)

  const onCloseAllHandler = () => {
    if (activeTab === TabType.POSITION && positionList.length > 0) {
      setCloseAllPositionDialogOpen(true)
    } else if (activeTab === TabType.ENTRUSTS && orderList.length > 0) {
      setCancelAllOrdersDialogOpen(true)
    }
  }

  const renderCloseAllButton = () => {
    if (
      (activeTab === TabType.POSITION && positionList.length > 0) ||
      (activeTab === TabType.ENTRUSTS && orderList.length > 0)
    ) {
      return (
        <InfoButton
          onClick={onCloseAllHandler}
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            lineHeight: 1,
            border: 0,
          }}
        >
          {activeTab === TabType.POSITION ? <Trans>Close All</Trans> : <Trans>Cancel All</Trans>}
        </InfoButton>
      )
    }
    return null
  }

  const {
    amountUnit,
    resetStore,
    setOrderType,
    setAutoMarginMode,
    setPrice,
    setCollateralAmount,
    setLongSize,
    setShortSize,
    setTpValue,
    setSlValue,
    setPositionAction,
    setAmountSliderValue,
    longSize,
    shortSize,
    setAmountUnit,
  } = useTradePanelStore()
  const { tickerData } = useMarketStore()

  useMount(() => {
    resetStore()
    setOrderType(OrderType.MARKET)
    setAutoMarginMode(true)
    setTpValue('0')
    setSlValue('0')
    setPrice('0')
    setCollateralAmount('0')
    setLongSize('0')
    setShortSize('0')
    setPositionAction(PositionActionEnum.OPEN)
  })

  const { maxOpenLong, maxOpenShort } = useGetOpenAvailable()

  useEffect(() => {
    const marketPrice = tickerData[symbolInfo?.poolId as string]?.price ?? 0
    setPrice(marketPrice.toString())
    setAmountUnit(AmountUnitEnum.QUOTE)
  }, [symbolInfo, tickerData, setPrice, setAmountUnit])

  const displayLongSize = useMemo(() => {
    if (parseBigNumber(longSize).eq(0)) {
      return '0'
    }

    return `${displayAmount(longSize)} ${symbolInfo?.quoteSymbol}`
  }, [longSize, amountUnit, symbolInfo])

  const displayShortSize = useMemo(() => {
    if (parseBigNumber(shortSize).eq(0)) {
      return '0'
    }
    return `${displayAmount(shortSize)} ${symbolInfo?.quoteSymbol}`
  }, [shortSize, amountUnit, symbolInfo])

  return (
    <div className="mt-[8px]">
      <Chart />
      {/* <Trade /> */}
      <div className="mt-[12px] flex items-center justify-between gap-[8px] px-[16px] text-[12px] text-white">
        <div className="flex items-center gap-[8px]">
          <p>
            <Trans>Market</Trans>
          </p>
          <div className="h-[12px] w-[1px] bg-[#4D515C]"></div>
          <div
            className="flex items-center justify-center gap-[2px]"
            role="button"
            onClick={openLeverageDialog}
          >
            <p>{leverage}x</p>
            <SortDown size={7} />
          </div>
          <div className="h-[12px] w-[1px] bg-[#4D515C]"></div>
          <Slippage
            simple
            defaultSlippage={defaultSlippage}
            direction={PositionActionEnum.OPEN}
            symbol={symbolInfo as MarketDetailResponse}
            color="#fff"
          />
        </div>
        <div className="flex items-center gap-[8px]">
          <WalletLine size={12} />
          <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-white">
            {formatNumberWithBaseToken(accountAssets?.availableMargin?.toString() ?? '0', {
              showUnit: false,
            })}
          </p>
          <AssetsDialogButton symbol={symbolInfo as MarketDetailResponse} />
          <div className="h-[12px] w-[1px] bg-[#4D515C]"></div>
          <ToTrade
            size={12}
            color="#fff"
            role="button"
            onClick={() => navigate(`/trade/${symbolInfo?.chainId}/${symbolInfo?.poolId}`)}
          />
        </div>
      </div>
      <AmountInput
        onchange={(value) => {
          const longSize = parseBigNumber(value)
            .div(100)
            .mul(parseBigNumber(maxOpenLong.quoteAmount))
            .toString()
          const shortSize = parseBigNumber(value)
            .div(100)
            .mul(parseBigNumber(maxOpenShort.quoteAmount))
            .toString()
          setLongSize(longSize)
          setShortSize(shortSize)
          setAmountSliderValue(value)
        }}
      />
      <div className="mt-[12px] flex items-center justify-between px-[16px]">
        <div className="flex items-center text-[12px]">
          <p className="text-tooltip text-[#848E9C]">
            <Trans>Margin</Trans>
          </p>
          <p className="ml-[4px] font-medium text-white">{displayLongSize}</p>
        </div>
        <div className="flex items-center text-[12px]">
          <p className="text-tooltip text-[#848E9C]">
            <Trans>Margin</Trans>
          </p>
          <p className="ml-[4px] font-medium text-white">{displayShortSize}</p>
        </div>
      </div>
      <div className="mt-[12px] px-[16px]">
        <CanSwitchWalletNetwork
          targetChainId={symbolInfo?.chainId}
          style={{
            marginTop: '8px',
          }}
        >
          <PlaceOrder showOrderSize={false} />
        </CanSwitchWalletNetwork>
      </div>
      <div className="flex w-full items-center justify-between gap-[20px] border-b border-[#202129] px-[16px]">
        <div className="flex-[1_1_0%]">
          <TradeRecordTabs
            value={activeTab}
            onChange={(event, value) => setActiveTab(value as TabType)}
          >
            <TradeRecordTab
              value={TabType.POSITION}
              label={
                positionList.length > 0 ? (
                  <Trans>Positions({positionList.length})</Trans>
                ) : (
                  <Trans>Positions </Trans>
                )
              }
            />
            <TradeRecordTab
              value={TabType.ENTRUSTS}
              label={
                orderList.length > 0 ? (
                  <Trans>Open Orders({orderList.length})</Trans>
                ) : (
                  <Trans>Open Orders</Trans>
                )
              }
            />
          </TradeRecordTabs>
        </div>
        {/* hide outer symbols */}
        <div className="shrink-0 text-[#848E9C]" role="button" onClick={() => navigate('/record')}>
          <Record size={16} />
        </div>
      </div>
      <HideOuterSymbols
        checked={hideOthersSymbols}
        onChange={setHideOthersSymbols}
        right={renderCloseAllButton()}
      />
      {activeTab === TabType.POSITION && <PositionList />}
      {activeTab === TabType.ENTRUSTS && <OpenOrderList />}
      <LeverageDialog />
      {!!closeAllPositionDialogOpen && <CloseAllPositionDialog />}
      {!!cancelAllOrdersDialogOpen && <CancelAllOrdersDialog />}
      {closeOrderConfirmDialogOpen && <CloseConfirmDialog />}
      {placeOrderConfirmDialogOpen && <PlaceOrderConfirmDialog />}
    </div>
  )
}
