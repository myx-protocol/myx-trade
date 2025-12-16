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
import { t } from '@lingui/core/macro'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { getChainInfo, type BaseChainInfo } from '@/config/chainInfo'
import { getSupportedChainIdsByEnv } from '@/config/chain'

// const TabButton = ({
//   activeTab,
//   onClick,
//   tabType,
//   children,
// }: {
//   activeTab: TabType
//   onClick: () => void
//   tabType: TabType
//   children: React.ReactNode
// }) => {
//   const isActive = activeTab === tabType
//   return (
//     <div
//       className="cursor-pointer text-[14px]"
//       style={{
//         color: isActive ? '#FFFFFF' : '#848E9C',
//         fontWeight: '500',
//         textShadow: isActive ? '0.3px 0 0 currentColor, -0.3px 0 0 currentColor' : 'none',
//       }}
//       onClick={onClick}
//     >
//       {children}
//     </div>
//   )
// }

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
  const {
    hideOthersSymbols,
    setHideOthersSymbols,
    setCloseAllPositionDialogOpen,
    selectChainId,
    setCancelAllOrdersDialogOpen,
  } = usePositionStore()
  const orderList = useGetOrderList(true)
  const positionList = useGetPositionList(true)
  const { symbolInfo } = useTradePageStore()
  const navigate = useNavigate()
  const onCloseAllHandler = () => {
    if (activeTab === TabType.POSITION) {
      setCloseAllPositionDialogOpen(true)
    } else if (activeTab === TabType.ENTRUSTS) {
      setCancelAllOrdersDialogOpen(true)
    }
  }
  const renderCloseAllButton = () => {
    if (selectChainId === '0') {
      return null
    }

    let isDisable = false

    if (activeTab === TabType.POSITION && positionList.length === 0) {
      isDisable = true
    }

    if (activeTab === TabType.ENTRUSTS && orderList.length === 0) {
      isDisable = true
    }

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
            color: isDisable ? '#848E9C' : 'white',
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
            onChange={(_, value) => setActiveTab(value as TabType)}
          >
            <TradeRecordTab
              value={TabType.POSITION}
              label={t`Positions${positionList.length > 0 ? `(${positionList.length})` : ''}`}
            />
            <TradeRecordTab
              value={TabType.ENTRUSTS}
              label={t`Open Orders${orderList.length > 0 ? `(${orderList.length})` : ''}`}
            />
          </TradeRecordTabs>
        </div>
        {/* hide outer symbols */}
        <div
          className="shrink-0 text-[#848E9C]"
          role="button"
          onClick={() =>
            navigate(`/record?chainId=${symbolInfo?.chainId}&poolId=${symbolInfo?.poolId}`)
          }
        >
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
  )
}
