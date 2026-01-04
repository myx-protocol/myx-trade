import { PoolProvider } from '@/pages/Earn/provider/PoolProvider.tsx'
import { NavBar } from '@/pages/Earn/detail/components/NavBar.tsx'
import { TabBar } from '@/pages/Earn/detail/components/TabBar.tsx'
import { useState } from 'react'
import { DetailTabType } from '@/pages/Cook/type.ts'
import { Navigate, useParams } from 'react-router-dom'
import { isSupportedChainFn } from '@/config/chain.ts'
import { TradingForm } from '@/pages/Earn/components/Trade'
import { Introduction } from '@/pages/Earn/detail/components/Introduction.tsx'
import { Chart } from '@/pages/Earn/components/Chart.tsx'
import { TokenInfo } from '@/pages/Earn/detail/components/TokenInfo.tsx'
import { TradingInfo } from '@/pages/Earn/detail/components/TradingInfo.tsx'

const Detail = () => {
  const { chainId, poolId } = useParams()
  const [type, setType] = useState<DetailTabType>(DetailTabType.Price)

  //   params validation
  if (!chainId || !poolId || !isSupportedChainFn(chainId ? parseInt(chainId) : undefined)) {
    return <Navigate to="/earn" />
  }
  return (
    <PoolProvider>
      <div className="bg-deep fixed top-[0] z-30 flex h-[100vh] min-h-[100vh] w-full flex-col overflow-y-auto pt-[4px] pb-[50px]">
        <div className={'bg-deep sticky top-[0] z-[1]'}>
          <NavBar />
          <TabBar value={type} onChange={(value) => setType(value)} />
        </div>
        <div>
          {type === DetailTabType.Price && (
            <>
              <Chart className={'px-[16px]'} />
              <TokenInfo className={'border-base mx-[16px] mt-[16px] border-b-1 py-[20px]'} />
              <TradingInfo className={'px-[16px] py-[20px]'} />
            </>
          )}
          {type === DetailTabType.Trade && <TradingForm className={'mt-[14px] px-[16px]'} />}
          {type === DetailTabType.Info && <Introduction className={'px-[16px]'} />}
        </div>
      </div>
    </PoolProvider>
  )
}

export default Detail
