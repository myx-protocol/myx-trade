import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { Chart } from '../Chart'
import { useMemo, useState } from 'react'
import { TabType } from '@/pages/Trade/types'
import { Trans } from '@lingui/react/macro'
import { Record, SortDown, WalletLine } from '@/components/Icon'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols'
import { DangerButton, InfoButton, PrimaryButton } from '@/components/UI/Button'
import { useNavigate } from 'react-router-dom'
import { Position } from '@/pages/Trade/components/Tables/Position'
import { Entrusts } from '@/pages/Trade/components/Tables/Entrust'
import { Slippage } from '@/components/Trade/TradePanel/Slippage'
import { PositionActionEnum } from '@/components/Trade/type'
import { usePriceStore } from '../../store'
import { useGetPoolConfig } from '@/hooks/use-get-pool-config'
import { getSlippageConfig } from '@/utils/slippage'
import type { MarketDetailResponse } from '@myx-trade/sdk'
import { useLeverageDialogStore } from '@/components/Trade/Dialog/Leverage/store'
import { useLeverage } from '@/components/Trade/hooks/useLeverage'
import { AssetsDialogButton } from '@/components/Trade/TradePanel/BalanceAndMarginMode'
import { useGetAccountAssets } from '@/hooks/balance/use-get-account-assets'
import { formatNumberWithBaseToken } from '@/utils/number'

import ToTrade from '@/components/Icon/set/ToTrade'
import { AmountInput } from './AmountInput'
import { LeverageDialog } from '@/components/Trade/Dialog/Leverage/Leverage'

export const PriceContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITION)
  const [hideOthersSymbols, setHideOthersSymbols] = useState(false)
  const { open: openLeverageDialog } = useLeverageDialogStore()
  const { symbolInfo } = usePriceStore()
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

  const renderCloseAllButton = () => {
    if (activeTab === TabType.POSITION || activeTab === TabType.ENTRUSTS) {
      return (
        <InfoButton
          style={{
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
            lineHeight: 1,
            border: 0,
          }}
        >
          <Trans>Close All</Trans>
        </InfoButton>
      )
    }
    return null
  }

  return (
    <div className="mt-[8px]">
      <Chart />
      {/* <Trade /> */}
      <div className="mt-[17px] flex items-center justify-between gap-[8px] px-[16px] text-[12px] text-white">
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
          console.log(value)
        }}
      />
      <div className="mt-[12px] flex items-center justify-between px-[16px]">
        <div className="flex items-center text-[12px]">
          <p className="text-tooltip text-[#848E9C]">
            <Trans>Margin</Trans>
          </p>
          <p className="ml-[4px] font-medium text-white">0.00 USDT</p>
        </div>
        <div className="flex items-center text-[12px]">
          <p className="text-tooltip text-[#848E9C]">
            <Trans>Margin</Trans>
          </p>
          <p className="ml-[4px] font-medium text-white">0.00 USDT</p>
        </div>
      </div>
      <div className="mt-[12px] flex items-center gap-[8px] px-[16px]">
        <PrimaryButton
          style={{
            width: '100%',
            height: '45px',
            fontSize: '13px',
            fontWeight: 'bold',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderRadius: '8px',
          }}
        >
          <Trans>Open Long</Trans>
        </PrimaryButton>
        <DangerButton
          style={{
            width: '100%',
            height: '45px',
            fontSize: '13px',
            fontWeight: 'bold',
            paddingLeft: '20px',
            paddingRight: '20px',
            borderRadius: '8px',
          }}
        >
          <Trans>Open Short</Trans>
        </DangerButton>
      </div>
      <div>
        {/* <PositionAction />
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
        </CanSwitchWalletNetwork> */}
      </div>
      <div className="mt-[12px] flex w-full items-center justify-between gap-[20px] border-b border-[#202129] px-[16px]">
        <div className="flex-[1_1_0%]">
          <TradeRecordTabs
            value={activeTab}
            onChange={(event, value) => setActiveTab(value as TabType)}
          >
            <TradeRecordTab value={TabType.POSITION} label={<Trans>Positions(1)</Trans>} />
            <TradeRecordTab value={TabType.ENTRUSTS} label={<Trans>Open Orders(2)</Trans>} />
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
      {activeTab === TabType.POSITION && <Position />}
      {activeTab === TabType.ENTRUSTS && <Entrusts />}
      <LeverageDialog />
    </div>
  )
}
