import { PositionActionEnum } from '../type'
import { BalanceAndMarginMode } from './BalanceAndMarginMode'
import { Leverage } from './Leverage'
import { MaxTradeAmount } from './MaxTradeAmount'
import { OrderForm } from './OrderForm'
import { OrderType } from './OrderType'
import { PlaceOrder } from './PlaceOrder'
import { PositionAction } from './PositionAction'
import { PositionMode } from './PositionMode'
import { TPSL } from './TPSL'
import { useTradePanelStore } from './store'
import { Slippage } from './Slippage'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useEffect } from 'react'
import {
  DEFAULT_SLIPPAGE_LEVEL_1,
  DEFAULT_SLIPPAGE_LEVEL_2,
  DEFAULT_SLIPPAGE_LEVEL_3,
  DEFAULT_SLIPPAGE_LEVEL_4,
} from '@/constant/slippage'
import { CanSwitchWalletNetwork } from '@/components/CanSwitchWalletNetwork'
import { useGetPoolList } from '../hooks/use-get-pool-list'
import { useTradePageStore } from '../store/TradePageStore'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { truncateAddress } from '@/utils/string'
import { useMarketStore } from '../store/MarketStore'
import { displayAmount } from '@/utils/number'
import { getChainInfo } from '@/config/chainInfo'
import type { ChainId } from '@myx-trade/sdk'
import ArrowDownIconFill from '@/components/UI/Icon/ArrowDownIconFill'
import { Charts } from '../Charts'
import { Tables } from '@/pages/Trade/components/Tables'

const getSlippage = (level: number) => {
  if (level === 1) {
    return DEFAULT_SLIPPAGE_LEVEL_1
  } else if (level === 2) {
    return DEFAULT_SLIPPAGE_LEVEL_2
  } else if (level === 3) {
    return DEFAULT_SLIPPAGE_LEVEL_3
  } else {
    return DEFAULT_SLIPPAGE_LEVEL_4
  }
}

export const TradePanel = () => {
  const { positionAction } = useTradePanelStore()
  const { poolConfig } = useGetPoolConfig()
  useGetPoolList()
  const {
    // receiveDialogOpen,
    openPositionSlippage,
    setOpenPositionSlippage,
    closePositionSlippage,
    setClosePositionSlippage,
    tpSlSlippage,
    setTpSlSlippage,
  } = useTradePanelStore()
  useEffect(() => {
    if (poolConfig) {
      if (!openPositionSlippage) {
        setOpenPositionSlippage(getSlippage(poolConfig.level))
      }
      if (!closePositionSlippage) {
        setClosePositionSlippage(getSlippage(poolConfig.level))
      }
      if (!tpSlSlippage) {
        setTpSlSlippage(getSlippage(poolConfig.level))
      }
    }
  }, [
    poolConfig,
    openPositionSlippage,
    setOpenPositionSlippage,
    closePositionSlippage,
    setClosePositionSlippage,
    tpSlSlippage,
    setTpSlSlippage,
  ])

  const { symbolInfo } = useTradePageStore()
  const { address } = useWalletConnection()
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[symbolInfo?.poolId as string]?.price ?? 0

  return (
    <div className="w-full py-[16px]">
      <div className="px-[16px]">
        <div className="flex w-full items-center justify-between">
          <div>
            <span className="text-[20px] font-[700] font-medium">
              {symbolInfo?.baseSymbol}
              {symbolInfo?.quoteSymbol}
            </span>
          </div>
          <div className="flex items-center gap-[4px]">
            {symbolInfo?.chainId && (
              <img src={getChainInfo(symbolInfo?.chainId as ChainId)?.logoUrl} alt="" />
            )}
            <span className="text-[12px] leading-[12px] text-[#fff]">
              {truncateAddress(address || '')}
            </span>
            <ArrowDownIconFill size={8} />
          </div>
        </div>
        <div className="mt-[8px] flex items-center justify-between">
          <span className="text-[22px] font-[700] font-medium">
            {displayAmount(marketPrice.toString())}
          </span>
        </div>
      </div>
      <div className="mt-[12px]">
        <Charts />
      </div>
      <div className="px-[16px]">
        <div className="mt-[12px] flex items-center justify-between">
          <div className="flex">
            <PositionMode />
            <Leverage />
            <Slippage
              defaultSlippage={getSlippage(poolConfig?.level ?? 1)}
              direction={positionAction}
            />
          </div>
        </div>
        <PositionAction />
        <OrderType />
        {positionAction === PositionActionEnum.OPEN && <BalanceAndMarginMode />}
        <OrderForm />
        {positionAction === PositionActionEnum.OPEN && <TPSL />}
        <CanSwitchWalletNetwork
          targetChainId={symbolInfo?.chainId}
          style={{
            marginTop: '8px',
          }}
        >
          <PlaceOrder />
        </CanSwitchWalletNetwork>
        <MaxTradeAmount />
      </div>
      <Tables />
    </div>
  )
}
