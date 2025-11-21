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
import { MarginAccount } from './MarginAccount'
import { PoolsInfo } from './PoolsInfo'
import { TokenInfo } from './TokenInfo'
import { CollapseGroup } from '../components/Collapse/CollapseGroup'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { useEffect } from 'react'
import {
  DEFAULT_SLIPPAGE_LEVEL_1,
  DEFAULT_SLIPPAGE_LEVEL_2,
  DEFAULT_SLIPPAGE_LEVEL_3,
  DEFAULT_SLIPPAGE_LEVEL_4,
} from '@/constant/slippage'
import { CanSwitchWalletNetwork } from '@/components/CanSwitchWalletNetwork'
import { ReceiveDialog } from './MarginAccount/ReceiveDialog'
import { useGetPoolList } from '../hooks/use-get-pool-list'
import { useTradePageStore } from '../store/TradePageStore'

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
    receiveDialogOpen,
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

  return (
    <div>
      <div className="flex h-full gap-[4px]">
        <PositionMode />
        <Leverage />
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
      <Slippage defaultSlippage={getSlippage(poolConfig?.level ?? 1)} direction={positionAction} />
      <MarginAccount />
      <CollapseGroup className="mt-[20px]">
        <PoolsInfo />
        <TokenInfo />
      </CollapseGroup>
      {receiveDialogOpen && <ReceiveDialog />}
    </div>
  )
}
