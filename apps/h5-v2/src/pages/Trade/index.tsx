import { LeverageDialog } from '@/components/Trade/Dialog/Leverage/Leverage'
import { TradePanel } from '@/components/Trade/TradePanel'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_PAIR_PATH } from '@/config/trade'
import { useMarketDetail } from '@/components/Trade/hooks/useMarketDetail'
import { useCallback, useRef } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useOraclePricePolling } from '@/components/Trade/hooks/useOraclePricePolling'
import type { ChainId } from '@myx-trade/sdk'

export const Trade = () => {
  const { chainId, poolId } = useParams()
  const { setSymbolInfo, symbolInfo } = useTradePageStore()

  const { client } = useMyxSdkClient()
  const { setTickerData } = useMarketStore()
  const { subscribeToTicker } = useSubscription()
  const { subscribeOraclePrice, unsubscribeOraclePrice } = useOraclePricePolling()
  const currentSymbolGlobalIdRef = useRef<number | undefined>(undefined)

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

  useUpdateEffect(() => {
    let unsubscribe: (() => void) | undefined = undefined
    if (!chainId || !symbolInfo || symbolInfo.globalId === currentSymbolGlobalIdRef.current) return
    if (client) {
      currentSymbolGlobalIdRef.current = symbolInfo.globalId
      client.markets
        .getTickerList({
          chainId: parseInt(chainId) as ChainId,
          poolIds: [symbolInfo.poolId],
        })
        .then((res) => {
          setTickerData(symbolInfo.poolId, res[0])
          // subscribe oracle price
          subscribeOraclePrice({ poolId: symbolInfo.poolId })
          // subscribe ticker data
          console.log('xd', currentSymbolGlobalIdRef.current, symbolInfo.globalId)
          if (currentSymbolGlobalIdRef.current === symbolInfo.globalId) {
            unsubscribe = subscribeToTicker({
              poolId: symbolInfo.poolId,
              globalId: symbolInfo.globalId,
            })
          }
        })
    }

    return () => {
      console.log('unsubscribe', unsubscribe)
      // unsubscribe oracle price
      if (symbolInfo) {
        unsubscribeOraclePrice({ poolId: symbolInfo.poolId })
      }
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe()
      }
    }
  }, [symbolInfo, client, chainId])

  if (!chainId || !poolId) {
    return <Navigate to={DEFAULT_PAIR_PATH} />
  }

  return (
    <>
      <div className="flex flex-[1_1_0%] justify-between gap-x-[4px]">
        <TradePanel />
      </div>
      <LeverageDialog />
    </>
  )
}

export default Trade
