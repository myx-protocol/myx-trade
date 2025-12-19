import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Header } from './components/Header'
import { PriceContent } from './components/PriceContent'
import { PriceInfo } from './components/PriceInfo'
import { Tabs } from './components/Tabs'
import { PriceTabEnum, usePriceStore } from './store'
import { useCallback } from 'react'
import { useMarketDetail } from '@/hooks/useMarketDetail'
import { DEFAULT_PRICE_PATH, DEFAULT_PAIR_PATH } from '@/config/trade'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { PoolContent } from './components/PoolContent'
import { useOraclePricePolling } from '@/components/Trade/hooks/useOraclePricePolling'
import { InfoContent } from './components/InfoContent'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'

const Price = () => {
  const { tab, symbolInfo, setSymbolInfo } = usePriceStore()
  const { setSymbolInfo: setTradeSymbolInfo } = useTradePageStore()

  const { chainId, poolId } = useParams()
  const { getDetail, client } = useMarketDetail()

  const navigate = useNavigate()

  const getMarketDetail = useCallback(() => {
    if (!chainId || !poolId || !client) return Promise.resolve(null)
    const _chainId = parseInt(chainId)

    getDetail({
      chainId: chainId ? parseInt(chainId) : undefined,
      poolId,
    }).then((marketDetail) => {
      if (!marketDetail) {
        return navigate(DEFAULT_PRICE_PATH)
      }
      if (marketDetail && _chainId === marketDetail?.chainId && poolId === marketDetail?.poolId) {
        setSymbolInfo(marketDetail)
        setTradeSymbolInfo(marketDetail)
      }
    })
  }, [chainId, poolId, getDetail, setSymbolInfo, setTradeSymbolInfo, navigate, client])

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

  const { subscribeOraclePrice, unsubscribeOraclePrice } = useOraclePricePolling()

  useUpdateEffect(() => {
    if (symbolInfo?.poolId && symbolInfo?.chainId) {
      subscribeOraclePrice({ poolId: symbolInfo.poolId })
      return () => {
        unsubscribeOraclePrice({ poolId: symbolInfo.poolId })
      }
    }
  }, [symbolInfo?.poolId, symbolInfo?.chainId, subscribeOraclePrice, unsubscribeOraclePrice])

  if (!chainId || !poolId) {
    return <Navigate to={DEFAULT_PRICE_PATH} />
  }
  return (
    <div>
      <Header />
      <PriceInfo />
      <Tabs />
      {tab === PriceTabEnum.Price ? <PriceContent /> : <></>}
      {tab === PriceTabEnum.Pool ? <PoolContent /> : <></>}
      {tab === PriceTabEnum.Info ? <InfoContent /> : <></>}
    </div>
  )
}

export default Price
