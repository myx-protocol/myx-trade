import { Order } from '@/components/CookDetail/Order'
import { isSupportedChainFn } from '@/config/chain'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { PoolProvider } from '@/pages/Cook/provider/PoolProvider.tsx'
import { NavBar } from '@/pages/Cook/detail/components/NavBar.tsx'
import { DetailTabType } from '@/pages/Cook/type.ts'
import { type ReactNode, useState } from 'react'
import { TabBar } from './components/TabBar'
import { PriceTab } from '@/pages/Cook/detail/components/PriceTab.tsx'
import { Info } from './components/Info'
import { Assets } from '@/pages/Cook/detail/components/Assets.tsx'
import { PositionTabBar } from '@/components/PositionTabBar'
import { Trans } from '@lingui/react/macro'
import { OpenOrders } from '@/pages/Cook/detail/components/OpenOrders.tsx'
import { HistoryOrders } from '@/pages/Cook/detail/components/HistoryOrders.tsx'
import type { LpAsset } from '@/request/lp/type.ts'
import { HideOuterSymbols } from '@/components/Record/HideOuterSymbols.tsx'
import { usePositionStore } from '@/store/position/createStore.ts'

enum AssetTabType {
  MyAssets = 'myAssets',
  OpenOrders = 'openOrders',
  HistoryOrders = 'historyOrders',
}

const AssetTabs: { label: ReactNode; value: AssetTabType }[] = [
  { label: <Trans>My Assets</Trans>, value: AssetTabType.MyAssets },
  { label: <Trans>Current Orders</Trans>, value: AssetTabType.OpenOrders },
  { label: <Trans>History Orders</Trans>, value: AssetTabType.HistoryOrders },
]

export const CookDetail = () => {
  const { chainId, poolId } = useParams()
  const navigate = useNavigate()

  const [type, setType] = useState<DetailTabType>(DetailTabType.Trade)
  const [activeTab, setActiveTab] = useState<AssetTabType>(AssetTabType.MyAssets)
  const [showAllAssets, setShowAllAssets] = useState(false)
  const { selectChainId } = usePositionStore()

  //   params validation
  if (!chainId || !poolId || !isSupportedChainFn(chainId ? parseInt(chainId) : undefined)) {
    return <Navigate to="/cook" />
  }

  return (
    <PoolProvider>
      <div className="bg-deep fixed top-[0] z-30 flex h-[100vh] min-h-[100vh] w-full flex-col overflow-y-auto pb-[50px]">
        <div className={'bg-deep sticky top-[0] z-[10]'}>
          <NavBar onBack={() => navigate('/cook', { replace: true })} />
          <TabBar value={type} onChange={(value) => setType(value as DetailTabType)} />
        </div>

        <div className={'relative'}>
          {type === DetailTabType.Price && <PriceTab />}

          {type === DetailTabType.Trade && (
            <>
              <Order />
              <div className={'bg-deep sticky top-[90px] z-[10] pt-[20px]'}>
                <PositionTabBar items={AssetTabs} value={activeTab} onChange={setActiveTab} />
                <HideOuterSymbols
                  checked={!showAllAssets}
                  onChange={(checked) => setShowAllAssets(!checked)}
                />
              </div>
              {activeTab === AssetTabType.MyAssets && (
                <Assets
                  showAll={showAllAssets}
                  chainId={Number(selectChainId) > 0 ? +chainId : undefined}
                />
              )}
              {activeTab === AssetTabType.OpenOrders && (
                <OpenOrders
                  showAll={showAllAssets}
                  chainId={Number(selectChainId) > 0 ? +chainId : undefined}
                />
              )}
              {activeTab === AssetTabType.HistoryOrders && (
                <HistoryOrders
                  showAll={showAllAssets}
                  chainId={Number(selectChainId) > 0 ? +chainId : undefined}
                />
              )}
            </>
          )}

          {type === DetailTabType.Info && <Info />}
        </div>

        {/* left */}
        <div className="mr-[4px] flex min-w-0 flex-[1_1_0%] flex-col"></div>
      </div>
    </PoolProvider>
  )
}
