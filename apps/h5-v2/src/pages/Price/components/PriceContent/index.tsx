import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { Chart } from '../Chart'
import { Trade } from '../Trade'
import { useState } from 'react'
import { TabType } from '@/pages/Trade/types'
import { Trans } from '@lingui/react/macro'
import { Record } from '@/components/Icon'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols'
import { InfoButton } from '@/components/UI/Button'
import { useNavigate } from 'react-router-dom'
import { Position } from '@/pages/Trade/components/Tables/Position'
import { Entrusts } from '@/pages/Trade/components/Tables/Entrust'

export const PriceContent = () => {
  const [activeTab, setActiveTab] = useState<TabType>(TabType.POSITION)
  const [hideOthersSymbols, setHideOthersSymbols] = useState(false)

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
      <Trade />
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
    </div>
  )
}
