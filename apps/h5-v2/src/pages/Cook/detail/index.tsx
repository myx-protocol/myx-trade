import { Assets } from '@/components/CookDetail/Assets'
import { Order } from '@/components/CookDetail/Order'
import { TokenInfo } from '@/components/CookDetail/TokenInfo'
import { TradingInfo } from '@/components/CookDetail/TradingInfo'
import { CollapseGroup } from '@/components/Trade/components/Collapse/CollapseGroup'
import { isSupportedChainFn } from '@/config/chain'
import { Navigate, useParams } from 'react-router-dom'
import { PoolProvider } from '@/pages/Cook/provider/PoolProvider.tsx'
import { NavBar } from '@/pages/Cook/detail/components/NavBar.tsx'
import { Trans } from '@lingui/react/macro'
import { DetailTabType, TrenchType } from '@/pages/Cook/type.ts'
import { useState } from 'react'
import { TabBar } from './components/TabBar'
import { PriceTab } from '@/pages/Cook/detail/components/PriceTab.tsx'
import { Info } from './components/Info'

export const CookDetail = () => {
  const { chainId, poolId } = useParams()
  const [type, setType] = useState<DetailTabType>(DetailTabType.Price)

  //   params validation
  if (!chainId || !poolId || !isSupportedChainFn(chainId ? parseInt(chainId) : undefined)) {
    return <Navigate to="/cook" />
  }

  return (
    <PoolProvider>
      <div className="flex min-h-screen flex-col pt-[4px] pb-[4px]">
        <div className={'bg-deep sticky top-[0] z-[1]'}>
          <NavBar />
          <TabBar value={type} onChange={(value) => setType(value as DetailTabType)} />
        </div>

        <div>
          {type === DetailTabType.Price && <PriceTab />}

          {type === DetailTabType.Trade && <Order />}

          {type === DetailTabType.Info && <Info />}
        </div>

        {/* left */}
        <div className="mr-[4px] flex min-w-0 flex-[1_1_0%] flex-col">
          {/*<MarketInfo />*/}

          {/*<Assets />*/}
        </div>
        {/* right */}
        {/*<div className="min-h-[inherit] w-[360px] flex-shrink-0 bg-[#101114] pb-[20px]">*/}
        {/*  <Order />*/}
        {/*  <CollapseGroup className="mr-[20px] ml-[20px]">*/}
        {/*    <TradingInfo />*/}
        {/*    <TokenInfo />*/}
        {/*  </CollapseGroup>*/}
        {/*</div>*/}
      </div>
    </PoolProvider>
  )
}
