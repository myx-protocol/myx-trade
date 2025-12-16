import { LeverageDialog } from '@/components/Trade/Dialog/Leverage/Leverage'
import { TradePanel } from '@/components/Trade/TradePanel'
import { useMount, useUnmount, useUpdateEffect } from 'ahooks'
import { useTradePageStore, type PoolConfig } from '@/components/Trade/store/TradePageStore'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_PAIR_PATH } from '@/config/trade'
import { useMarketDetail } from '@/components/Trade/hooks/useMarketDetail'
import { useCallback, useRef } from 'react'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useMarketStore } from '@/components/Trade/store/MarketStore'
import { useSubscription } from '@/components/Trade/hooks/useMarketSubscription'
import { useOraclePricePolling } from '@/components/Trade/hooks/useOraclePricePolling'
import type { ChainId } from '@myx-trade/sdk'
import { getPoolLevelConfig } from '@/api'
import { AccountDialog } from '@/components/AccountDialog'
import useGlobalStore from '@/store/globalStore'
import { usePositionStore } from '@/store/position/createStore'
import { CancelAllOrdersDialog } from './components/CancelAllOrdersDialog'
import { CloseAllPositionDialog } from './components/CloseAllPositionDialog'
export const Trade = () => {
  const { chainId, poolId } = useParams()
  const { setSymbolInfo, symbolInfo, setPoolConfig } = useTradePageStore()
  const { accountDialogOpen } = useGlobalStore()
  const { client } = useMyxSdkClient()
  const { setTickerData } = useMarketStore()
  const { subscribeToTicker } = useSubscription()
  const { subscribeOraclePrice, unsubscribeOraclePrice } = useOraclePricePolling()
  const { closeAllPositionDialogOpen, cancelAllOrdersDialogOpen } = usePositionStore()

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
    getPoolLevelConfig(poolId as string, parseInt(chainId) as number).then((res: any) => {
      if (res.code === 0) {
        setPoolConfig(res.data as unknown as PoolConfig)
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
      <TradePanel />
      <LeverageDialog />
      {accountDialogOpen && <AccountDialog />}
      {!!closeAllPositionDialogOpen && <CloseAllPositionDialog />}
      {!!cancelAllOrdersDialogOpen && <CancelAllOrdersDialog />}
    </>
  )
}

export default Trade
