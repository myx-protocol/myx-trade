import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { TabType } from '@/pages/Trade/types'
import { Trans } from '@lingui/react/macro'

export const RecordTab = ({ tab, setTab }: { tab: TabType; setTab: (tab: TabType) => void }) => {
  return (
    <div className="w-full px-[16px]">
      <TradeRecordTabs
        variant="scrollable"
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
      >
        <TradeRecordTab value={TabType.POSITION} label={<Trans>Position(1)</Trans>} />
        <TradeRecordTab value={TabType.ENTRUSTS} label={<Trans>Entrusts(2)</Trans>} />
        <TradeRecordTab value={TabType.HISTORY} label={<Trans>Order History</Trans>} />
        <TradeRecordTab value={TabType.POSITION_HISTORY} label={<Trans>Positions History</Trans>} />
        <TradeRecordTab value={TabType.FINANCE} label={<Trans>Transaction History</Trans>} />
      </TradeRecordTabs>
    </div>
  )
}
