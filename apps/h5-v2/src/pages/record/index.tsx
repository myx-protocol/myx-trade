import { SecondHeader } from '@/components/SecondHeader'
import { Trans } from '@lingui/react/macro'
import React, { useEffect } from 'react'
import { RecordTab } from './components/RecordTab'
import { TabType } from '../Trade/types'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols'
import { InfoButton } from '@/components/UI/Button'
// import { usePositionStore } from '@/store/position/createStore'
import { PositionList } from './components/PositionList'
import { OpenOrderList } from './components/OpenOrderList'
import { OrderHistoryList } from './components/OrderHistoryList'
import { PositionHistoryList } from './components/PositionHistoryList'
import { FinanceList } from './components/FinanceList'
import useGlobalStore from '@/store/globalStore'
import { useLocation } from 'react-router-dom'
import { useMarketDetail } from '@/components/Trade/hooks/useMarketDetail'
import { usePositionStore } from '@/store/position/createStore'
import { CancelAllOrdersDialog } from '../Trade/components/CancelAllOrdersDialog'
import { CloseAllPositionDialog } from '../Trade/components/CloseAllPositionDialog'
import { useGetPositionList } from '@/hooks/position/use-get-position-list'
import { useGetOrderList } from '@/hooks/order/use-get-order-list'

const Record = () => {
  const [tab, setTab] = React.useState<TabType>(TabType.POSITION)
  const [hideOuterSymbols, setHideOuterSymbols] = React.useState(false)
  const {
    setCloseAllPositionDialogOpen,
    setCancelAllOrdersDialogOpen,
    closeAllPositionDialogOpen,
    cancelAllOrdersDialogOpen,
    selectChainId,
  } = usePositionStore()
  const { search } = useLocation()
  const { setSymbolInfo } = useGlobalStore()
  const params = new URLSearchParams(search)
  const chainId = params.get('chainId') ?? ''
  const poolId = params.get('poolId') ?? ''
  const positionList = useGetPositionList(true)
  const orderList = useGetOrderList(true)

  const { getDetail } = useMarketDetail({
    poolId: poolId || '',
    chainId: chainId ? parseInt(chainId) : undefined,
  })

  useEffect(() => {
    getDetail().then((marketDetail) => {
      setSymbolInfo(marketDetail)
    })
  }, [getDetail, setSymbolInfo])

  const onCloseAllHandler = () => {
    if (tab === TabType.POSITION) {
      setCloseAllPositionDialogOpen(true)
    } else if (tab === TabType.ENTRUSTS) {
      setCancelAllOrdersDialogOpen(true)
    }
  }

  const renderCloseAllButton = () => {
    if (selectChainId === '0') {
      return null
    }

    let isDisable = false

    if (tab === TabType.POSITION && positionList.length === 0) {
      isDisable = true
    }

    if (tab === TabType.ENTRUSTS && orderList.length === 0) {
      isDisable = true
    }

    if (tab === TabType.POSITION || tab === TabType.ENTRUSTS) {
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
          {tab === TabType.POSITION ? <Trans>Close All</Trans> : <Trans>Cancel All</Trans>}
        </InfoButton>
      )
    }
    return null
  }
  return (
    <div>
      <SecondHeader title={<Trans>My trades</Trans>} />
      <RecordTab tab={tab} setTab={setTab} />
      <HideOuterSymbols
        checked={hideOuterSymbols}
        onChange={setHideOuterSymbols}
        right={renderCloseAllButton()}
      />
      {tab === TabType.POSITION && <PositionList />}
      {tab === TabType.ENTRUSTS && <OpenOrderList />}
      {tab === TabType.HISTORY && <OrderHistoryList />}
      {tab === TabType.POSITION_HISTORY && <PositionHistoryList />}
      {tab === TabType.FINANCE && <FinanceList />}
      {!!closeAllPositionDialogOpen && <CloseAllPositionDialog />}
      {!!cancelAllOrdersDialogOpen && <CancelAllOrdersDialog />}
    </div>
  )
}
export default Record
