import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { TabType } from '@/pages/Trade/types'
import { Trans } from '@lingui/react/macro'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'

export const RecordTab = ({ tab, setTab }: { tab: TabType; setTab: (tab: TabType) => void }) => {
  const positionList = useGetPositionList()
  const orderList = useGetOrderList()
  return (
    <div className="w-full px-[16px]">
      <TradeRecordTabs
        variant="scrollable"
        value={tab}
        onChange={(_, newValue) => setTab(newValue)}
      >
        <TradeRecordTab
          value={TabType.POSITION}
          label={<Trans>Position({positionList.length})</Trans>}
        />
        <TradeRecordTab
          value={TabType.ENTRUSTS}
          label={<Trans>Entrusts({orderList.length})</Trans>}
        />
        <TradeRecordTab value={TabType.HISTORY} label={<Trans>Order History</Trans>} />
        <TradeRecordTab value={TabType.POSITION_HISTORY} label={<Trans>Positions History</Trans>} />
        <TradeRecordTab value={TabType.FINANCE} label={<Trans>Transaction History</Trans>} />
      </TradeRecordTabs>
    </div>
  )
}
