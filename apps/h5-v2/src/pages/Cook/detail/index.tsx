import { Assets } from '@/components/CookDetail/Assets'
import { Charts } from '@/components/CookDetail/Charts'
import { MarketInfo } from '@/components/CookDetail/MarketInfo'
import { Order } from '@/components/CookDetail/Order'
import { TokenInfo } from '@/components/CookDetail/TokenInfo'
import { TradingInfo } from '@/components/CookDetail/TradingInfo'
import { CollapseGroup } from '@/components/Trade/components/Collapse/CollapseGroup'
import { isSupportedChainFn } from '@/config/chain'
import { Navigate, useParams } from 'react-router-dom'
import { PoolProvider } from '@/pages/Cook/provider/PoolProvider.tsx'

export const CookDetail = () => {
  const { chainId, poolId } = useParams()

  //   params validation
  if (!chainId || !poolId || !isSupportedChainFn(chainId ? parseInt(chainId) : undefined)) {
    return <Navigate to="/cook" />
  }

  return (
    <PoolProvider>
      <div className="flex min-h-[inherit] min-w-[1200px] bg-[#202129] pt-[4px] pb-[4px]">
        {/* left */}
        <div className="mr-[4px] flex min-w-0 flex-[1_1_0%] flex-col">
          <MarketInfo />
          <Charts />
          <Assets />
        </div>
        {/* right */}
        <div className="min-h-[inherit] w-[360px] flex-shrink-0 bg-[#101114] pb-[20px]">
          <Order />
          <CollapseGroup className="mr-[20px] ml-[20px]">
            <TradingInfo />
            <TokenInfo />
          </CollapseGroup>
        </div>
      </div>
    </PoolProvider>
  )
}
