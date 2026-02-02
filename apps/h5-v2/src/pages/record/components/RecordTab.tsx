import { TradeRecordTab, TradeRecordTabs } from '@/components/Record/TradeRecordTabs'
import { TabType } from '@/pages/Trade/types'
import { Trans } from '@lingui/react/macro'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'
import { useEffect, useRef } from 'react'

export const RecordTab = ({ tab, setTab }: { tab: TabType; setTab: (tab: TabType) => void }) => {
  const positionList = useGetPositionList()
  const orderList = useGetOrderList()
  const tabsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!tabsRef.current) return

    // 找到当前选中的 tab 元素
    const selectedTab = tabsRef.current.querySelector(
      `[role="tab"][aria-selected="true"]`,
    ) as HTMLElement

    if (selectedTab) {
      // 滚动到选中的 tab，使其居中显示
      selectedTab.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [tab])

  return (
    <div className="w-full border-b border-[#202129] px-[16px]">
      <TradeRecordTabs
        ref={tabsRef}
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
