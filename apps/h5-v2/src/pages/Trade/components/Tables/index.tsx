import { useState } from 'react'
import { TabType } from '../../types'
import { Trans } from '@lingui/react/macro'
import { InfoButton } from '@/components/UI/Button'
import { usePositionStore } from '@/store/position/createStore'
import { Position } from './Position'
import { Entrusts } from './Entrust'

import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { Record } from '@/components/Icon'
import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { useNavigate } from 'react-router-dom'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols'
import useGlobalStore from '@/store/globalStore'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { CancelAllOrdersDialog } from '../CancelAllOrdersDialog'

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

export const Tables = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITION)
  const { hideOthersSymbols, setHideOthersSymbols, setCloseAllPositionDialogOpen } =
    usePositionStore()
  const { setCancelAllOrdersDialogOpen, cancelAllOrdersDialogOpen } = useGlobalStore()
  const orderList = useGetOrderList()
  const positionList = useGetPositionList()

  const navigate = useNavigate()
  const onCloseAllHandler = () => {
    if (activeTab === TabType.POSITION) {
      setCloseAllPositionDialogOpen(true)
    } else if (activeTab === TabType.ENTRUSTS) {
      setCancelAllOrdersDialogOpen(true)
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
          {activeTab === TabType.POSITION ? <Trans>Close All</Trans> : <Trans>Cancel All</Trans>}
        </InfoButton>
      )
    }
    return null
  }
  return (
    <>
      <div className="flex w-full items-center justify-between gap-[20px] border-b border-[#202129] px-[16px]">
        <div className="flex-[1_1_0%]">
          <TradeRecordTabs
            value={activeTab}
            onChange={(event, value) => setActiveTab(value as TabType)}
          >
            <TradeRecordTab
              value={TabType.POSITION}
              label={<Trans>Positions({positionList.length})</Trans>}
            />
            <TradeRecordTab
              value={TabType.ENTRUSTS}
              label={<Trans>Open Orders({orderList.length})</Trans>}
            />
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
      {!!cancelAllOrdersDialogOpen && <CancelAllOrdersDialog />}
    </>
    // {activeTab === TabType.POSITION_HISTORY && <PositionHistory />}
    // {activeTab === TabType.ORDER_HISTORY && <OrderHistory />}
    // {activeTab === TabType.FINANCE && <Finance />}
  )
}
