import { PoolProvider } from '@/pages/Earn/provider/PoolProvider.tsx'
import { NavBar } from '@/pages/Earn/detail/components/NavBar.tsx'
import { TabBar } from '@/pages/Earn/detail/components/TabBar.tsx'
import { useState } from 'react'
import { DetailTabType } from '@/pages/Cook/type.ts'
import { Navigate, useParams } from 'react-router-dom'
import { isSupportedChainFn } from '@/config/chain.ts'
import { TradingForm } from '@/pages/Earn/components/Trade'
import { Introduction } from '@/pages/Earn/components/Introduction.tsx'
import { Chart } from '@/pages/Earn/components/Chart.tsx'
import { TokenInfo } from '@/pages/Earn/components/TokenInfo.tsx'
import { TradingInfo } from '@/pages/Earn/components/TradingInfo.tsx'

const Detail = () => {
  const { chainId, poolId } = useParams()
  const [type, setType] = useState<DetailTabType>(DetailTabType.Price)

  //   params validation
  if (!chainId || !poolId || !isSupportedChainFn(chainId ? parseInt(chainId) : undefined)) {
    return <Navigate to="/earn" />
  }
  return (
    <PoolProvider>
      <div className="bg-deep h-m-[100vh] relative z-30 flex flex-col pt-[4px] pb-[4px]">
        <div className={'bg-deep sticky top-[0] z-[1]'}>
          <NavBar />
          <TabBar value={type} onChange={(value) => setType(value)} />
        </div>
        <div className={'px-[16px]'}>
          {type === DetailTabType.Price && (
            <>
              <Chart />
              <TokenInfo />
              <TradingInfo />
            </>
          )}
          {type === DetailTabType.Trade && <TradingForm className={'mt-[14px]'} />}
          {type === DetailTabType.Info && <Introduction />}
        </div>
      </div>
    </PoolProvider>
  )
}

export default Detail
