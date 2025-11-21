import { CurrentMarket } from '@/components/Trade/CurrentMarket'
import { Tables } from './components/Tables'
import { Charts } from '@/components/Trade/Charts'
import { LeverageDialog } from '@/components/Trade/Dialog/Leverage/Leverage'
import { TradePanel } from '@/components/Trade/TradePanel'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_PAIR_PATH } from '@/config/trade'
import { useMarketDetail } from '@/components/Trade/hooks/useMarketDetail'
import { useCallback } from 'react'

export const Trade = () => {
  const { chainId, poolId } = useParams()
  const { setSymbolInfo } = useTradePageStore()

  const { getDetail } = useMarketDetail({
    poolId: poolId || '',
    chainId: chainId ? parseInt(chainId) : undefined,
  })

  const navigate = useNavigate()

  const getMarketDetail = useCallback(() => {
    if (!chainId || !poolId) return Promise.resolve(null)
    const _chainId = parseInt(chainId)

    getDetail().then((marketDetail) => {
      if (!marketDetail) {
        return navigate(DEFAULT_PAIR_PATH)
      }
      if (marketDetail && _chainId === marketDetail?.chainId && poolId === marketDetail?.poolId) {
        setSymbolInfo(marketDetail)
      }
    })
  }, [chainId, poolId, getDetail, setSymbolInfo, navigate])

  useMount(() => {
    if (chainId && poolId) {
      getMarketDetail()
    }
  })

  useUpdateEffect(() => {
    getMarketDetail()
  }, [chainId, poolId, getMarketDetail])

  useUnmount(() => {
    setSymbolInfo(null)
  })

  if (!chainId || !poolId) {
    return <Navigate to={DEFAULT_PAIR_PATH} />
  }

  return (
    <>
      <div className="flex flex-[1_1_0%] justify-between gap-x-[4px] bg-[var(--bg-plus)]">
        <div className="mt-[4px] flex flex-[1_1_0%] flex-col overflow-x-auto">
          <CurrentMarket />
          {/* <MarketSwiper /> */}
          <Charts />
          <Tables />
        </div>
        <div className="mt-[4px] w-[325px] self-stretch bg-[#101114] p-[16px]">
          <TradePanel />
        </div>
      </div>
      <LeverageDialog />
    </>
  )
}

export default Trade
