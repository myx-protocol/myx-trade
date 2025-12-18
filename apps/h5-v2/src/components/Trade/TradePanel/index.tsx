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
// import { MarginAccount } from './MarginAccount'
// import { PoolsInfo } from './PoolsInfo'
// import { TokenInfo } from './TokenInfo'
// import { CollapseGroup } from '../components/Collapse/CollapseGroup'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import menuIcon from '@/assets/icon/menu.png'
import { useEffect, useMemo, useState } from 'react'

import { CanSwitchWalletNetwork } from '@/components/CanSwitchWalletNetwork'
import { ReceiveDialog } from './MarginAccount/ReceiveDialog'
import { useTradePageStore } from '../store/TradePageStore'
import { getSlippage, getSlippageConfig, setSlippage, SlippageTypeEnum } from '@/utils/slippage'
import { truncateAddress } from '@/utils/string'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useMarketStore } from '../store/MarketStore'
import { Charts } from '../Charts'
import { getChainInfo } from '@/config/chainInfo'
import type { ChainId } from '@/config/chain'
import ArrowDownIconFill from '@/components/UI/Icon/ArrowDownIconFill'
import { Tables } from '@/pages/Trade/components/Tables'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent'
import { Price } from '@/components/Price'
import useGlobalStore from '@/store/globalStore'
import { SettingDrawer } from '@/components/SettingDrawer'
import { PlaceOrderConfirmDialog } from '@/components/PlaceOrderConfirm'
import { CloseConfirmDialog } from '@/components/CloseConfirmDialog'
import { useWalletStore } from '@/store/wallet/createStore'
import { GlobalContractSearch } from '@/components/GlobalContractSearch/GlobalContractSearch'
import { useNavigate } from 'react-router-dom'

export const TradePanel = () => {
  const { positionAction, resetStore } = useTradePanelStore()
  const { symbolInfo } = useTradePageStore()
  const { setLoginModalOpen } = useWalletStore()
  const [isOpenGlobalContractSearch, setIsOpenGlobalContractSearch] = useState(false)
  const { poolConfig } = useGetPoolConfig(
    symbolInfo?.poolId as string,
    symbolInfo?.chainId as number,
  )
  const [settingDialogOpen, setSettingDialogOpen] = useState(false)
  const { receiveDialogOpen } = useTradePanelStore()
  const { setAccountDialogOpen, placeOrderConfirmDialogOpen, closeOrderConfirmDialogOpen } =
    useGlobalStore()

  const { address } = useWalletConnection()
  const { tickerData } = useMarketStore()
  const marketPrice = tickerData[symbolInfo?.poolId as string]?.price ?? 0

  useEffect(() => {
    if (poolConfig) {
      const slippageConfig = getSlippageConfig(poolConfig.level)
      const openSlippage = getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.OPEN,
      })
      if (!openSlippage) {
        setSlippage({
          chainId: symbolInfo?.chainId ?? 0,
          poolId: symbolInfo?.poolId ?? '',
          type: SlippageTypeEnum.OPEN,
          slippage: slippageConfig,
        })
      }
      const closeSlippage = getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.CLOSE,
      })
      if (!closeSlippage) {
        setSlippage({
          chainId: symbolInfo?.chainId ?? 0,
          poolId: symbolInfo?.poolId ?? '',
          type: SlippageTypeEnum.CLOSE,
          slippage: slippageConfig,
        })
      }
      const tpSlSlippage = getSlippage({
        chainId: symbolInfo?.chainId ?? 0,
        poolId: symbolInfo?.poolId ?? '',
        type: SlippageTypeEnum.TPSL,
      })
      if (!tpSlSlippage) {
        setSlippage({
          chainId: symbolInfo?.chainId ?? 0,
          poolId: symbolInfo?.poolId ?? '',
          type: SlippageTypeEnum.TPSL,
          slippage: slippageConfig,
        })
      }
    }

    if (symbolInfo?.chainId) {
      resetStore()
    }
  }, [poolConfig, symbolInfo, resetStore])

  const defaultSlippage = useMemo(() => {
    return getSlippageConfig(poolConfig?.level ?? 1)
  }, [poolConfig?.level])
  const navigate = useNavigate()

  return (
    <>
      <div className="w-full py-[16px]">
        <div className="px-[16px]">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-[4px]">
              <img
                src={menuIcon}
                alt=""
                className="h-[20px] w-[20px]"
                onClick={() => {
                  // setSettingDialogOpen(true)
                  setIsOpenGlobalContractSearch(true)
                }}
              />
              <span className="ml-[4px] text-[20px] font-[700] font-medium">
                {symbolInfo?.baseSymbol}
                {symbolInfo?.quoteSymbol}
              </span>
            </div>
            <div
              className="flex items-center gap-[4px]"
              onClick={() => {
                if (address) {
                  setAccountDialogOpen(true)
                  return
                }

                setLoginModalOpen(true)
              }}
            >
              {symbolInfo?.chainId && (
                <img src={getChainInfo(symbolInfo?.chainId as ChainId)?.logoUrl} alt="" />
              )}
              <span className="text-[12px] leading-[12px] text-[#fff]">
                {truncateAddress(address || '') || ''}
              </span>
              <ArrowDownIconFill size={8} />
            </div>
          </div>
          <div className="mt-[8px] flex items-center justify-between">
            <div className="flex items-center gap-[4px]">
              <Price
                className="text-[22px] font-[700] font-medium"
                value={marketPrice}
                showUnit={false}
              />
              <RiseFallTextPrecent value={tickerData[symbolInfo?.poolId as string]?.change ?? 0} />
            </div>
          </div>
        </div>
        <div className="mt-[12px]">
          <Charts />
        </div>
        <div className="px-[16px]">
          <div className="flex h-full gap-[4px]">
            <PositionMode />
            <Leverage />
            <Slippage defaultSlippage={defaultSlippage} direction={positionAction} />
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
        <div className="mt-[12px]">
          <Tables />
        </div>
        {receiveDialogOpen && <ReceiveDialog />}
        {settingDialogOpen && (
          <SettingDrawer open={settingDialogOpen} onOpenChange={setSettingDialogOpen} />
        )}
        {closeOrderConfirmDialogOpen && <CloseConfirmDialog />}
        {placeOrderConfirmDialogOpen && <PlaceOrderConfirmDialog />}
      </div>
      <GlobalContractSearch
        isOpen={isOpenGlobalContractSearch}
        onClose={() => setIsOpenGlobalContractSearch(false)}
        onOpen={() => setIsOpenGlobalContractSearch(true)}
        onSelected={(item) => {
          navigate(`/trade/${item.chainId}/${item.poolId}`, {
            replace: true,
          })
          setIsOpenGlobalContractSearch(false)
        }}
      />
    </>
  )
}
