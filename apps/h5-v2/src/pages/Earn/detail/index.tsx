import { PoolProvider } from '@/pages/Earn/provider/PoolProvider.tsx'
import { NavBar } from '@/pages/Earn/detail/components/NavBar.tsx'
import { TabBar } from '@/pages/Earn/detail/components/TabBar.tsx'
import { type ReactNode, useState } from 'react'
import { DetailTabType } from '@/pages/Cook/type.ts'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { isSupportedChainFn } from '@/config/chain.ts'
import { TradingForm } from '@/pages/Earn/components/Trade'
import { Introduction } from '@/pages/Earn/detail/components/Introduction.tsx'
import { Chart } from '@/pages/Earn/components/Chart.tsx'
import { TokenInfo } from '@/pages/Earn/detail/components/TokenInfo.tsx'
import { TradingInfo } from '@/pages/Earn/detail/components/TradingInfo.tsx'
import { BenchWarning } from '@/pages/Earn/components/BenchWarning.tsx'
import { PositionTabBar } from '@/components/PositionTabBar'
import { Trans } from '@lingui/react/macro'
import { MyHoldings } from '@/pages/Earn/detail/components/MyHoldings.tsx'
import { OpenOrders } from '@/pages/Earn/detail/components/OpenOrders.tsx'
import { HistoryOrders } from '@/pages/Earn/detail/components/HistoryOrders.tsx'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols.tsx'
import { usePositionStore } from '@/store/position/createStore.ts'

enum AssetTabType {
  MyHoldings = 'myHoldings',
  OpenOrders = 'openOrders',
  HistoryOrders = 'historyOrders',
}

const AssetTabs: { label: ReactNode; value: AssetTabType }[] = [
  { label: <Trans>My Holdings</Trans>, value: AssetTabType.MyHoldings },
  { label: <Trans>Open Orders</Trans>, value: AssetTabType.OpenOrders },
  { label: <Trans>Order History</Trans>, value: AssetTabType.HistoryOrders },
]

const Detail = () => {
  const { chainId, poolId } = useParams()
  const navigate = useNavigate()

  const [type, setType] = useState<DetailTabType>(DetailTabType.Trade)
  const [activeTab, setActiveTab] = useState<AssetTabType>(AssetTabType.MyHoldings)
  const [showAll, setShowAll] = useState(false)
  const { selectChainId } = usePositionStore()

  //   params validation
  if (!chainId || !poolId || !isSupportedChainFn(chainId ? parseInt(chainId) : undefined)) {
    return <Navigate to="/earn" />
  }
  return (
    <PoolProvider>
      <div className="bg-deep fixed top-[0] z-30 flex h-[100vh] min-h-[100vh] w-full flex-col overflow-y-auto pb-[50px]">
        <div className={'bg-deep sticky top-[0] z-[10]'}>
          <NavBar onBack={() => navigate('/earn', { replace: true })} />
          <TabBar value={type} onChange={(value) => setType(value)} />
        </div>
        <div className={'relative'}>
          {type === DetailTabType.Price && (
            <>
              <Chart className={'px-[16px]'} />
              <TokenInfo className={'border-base mx-[16px] mt-[12px] border-b pb-[20px]'} />
              <TradingInfo className={'px-[16px] py-[20px]'} />
            </>
          )}
          {type === DetailTabType.Trade && (
            <>
              <TradingForm className={'mt-[14px] px-[16px]'} />{' '}
              <div className="mt-[12px] flex flex-col gap-[12px] px-[16px]">
                <BenchWarning />
              </div>
              <div className={'bg-deep sticky top-[90px] z-[10] pt-[20px]'}>
                <PositionTabBar items={AssetTabs} value={activeTab} onChange={setActiveTab} />
                <HideOuterSymbols checked={!showAll} onChange={(checked) => setShowAll(!checked)} />
              </div>
              {activeTab === AssetTabType.MyHoldings && (
                <MyHoldings
                  showAll={showAll}
                  chainId={Number(selectChainId) > 0 ? +chainId : undefined}
                />
              )}
              {activeTab === AssetTabType.OpenOrders && (
                <OpenOrders
                  showAll={showAll}
                  chainId={Number(selectChainId) > 0 ? +chainId : undefined}
                />
              )}
              {activeTab === AssetTabType.HistoryOrders && (
                <HistoryOrders
                  showAll={showAll}
                  chainId={Number(selectChainId) > 0 ? +chainId : undefined}
                />
              )}
            </>
          )}
          {type === DetailTabType.Info && <Introduction className={'px-[16px]'} />}
        </div>
      </div>
    </PoolProvider>
  )
}

export default Detail
