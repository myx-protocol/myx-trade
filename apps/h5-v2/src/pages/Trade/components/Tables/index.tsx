import { Fragment, useMemo, useState } from 'react'
import { TabType } from '../../types'
import { Trans } from '@lingui/react/macro'
import { CheckBox } from '@/components/UI/CheckBox'
import { InfoButton } from '@/components/UI/Button'
import { usePositionStore } from '@/store/position/createStore'
import { Select } from '@/components/UI/Select'
import { t } from '@lingui/core/macro'
import { Position } from './Position'
import { Entrusts } from './Entrust'
import { PositionHistory } from './PositionHistory'
import { OrderHistory } from './OrderHistory'
import { Finance } from './Finance'
import { getSupportedChainIdsByEnv } from '@/config/chain'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { toast } from 'react-hot-toast'
import { Record } from '@/components/Icon'
import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { useNavigate } from 'react-router-dom'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols'

const TabButton = ({
  activeTab,
  onClick,
  tabType,
  children,
}: {
  activeTab: TabType
  onClick: () => void
  tabType: TabType
  children: React.ReactNode
}) => {
  const isActive = activeTab === tabType
  return (
    <div
      className="cursor-pointer text-[14px]"
      style={{
        color: isActive ? '#FFFFFF' : '#848E9C',
        fontWeight: '500',
        textShadow: isActive ? '0.3px 0 0 currentColor, -0.3px 0 0 currentColor' : 'none',
      }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

const CHAIN_LIST: Array<
  BaseChainInfo & {
    chainId: number
  }
> = getSupportedChainIdsByEnv().map((chainId) => {
  return {
    ...getChainInfo(chainId),
    chainId,
  }
})

export const Tables = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITION)
  const { hideOthersSymbols, setHideOthersSymbols, setCloseAllPositionDialogOpen } =
    usePositionStore()
  const orders = useGetOrderList()
  const { client } = useMyxSdkClient()
  const navigate = useNavigate()
  const onCloseAllHandler = () => {
    if (activeTab === TabType.POSITION) {
      setCloseAllPositionDialogOpen(true)
    } else if (activeTab === TabType.ENTRUSTS) {
      // todo: cancel all orders
    }
  }
  const renderCloseAllButton = () => {
    if (activeTab === TabType.POSITION || activeTab === TabType.ENTRUSTS) {
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
          <Trans>Close All</Trans>
        </InfoButton>
      )
    }
    return null
  }
  return (
    <>
      <div className="flex w-full items-center justify-between gap-[20px] px-[16px]">
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
          <Record size={18} />
        </div>
      </div>
      <HideOuterSymbols
        checked={hideOthersSymbols}
        onChange={setHideOthersSymbols}
        right={renderCloseAllButton()}
      />
      {activeTab === TabType.POSITION && <Position />}
      {activeTab === TabType.ENTRUSTS && <Entrusts />}
    </>

    // {activeTab === TabType.POSITION_HISTORY && <PositionHistory />}
    // {activeTab === TabType.ORDER_HISTORY && <OrderHistory />}
    // {activeTab === TabType.FINANCE && <Finance />}
  )
}
