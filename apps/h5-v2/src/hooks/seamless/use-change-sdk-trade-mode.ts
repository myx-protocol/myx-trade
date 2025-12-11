import { TradeMode } from '@/pages/Trade/types'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useCallback } from 'react'

export const useChangeSdkTradeMode = (chainId?: number) => {
  const { tradeMode, setTradeMode } = useGlobalStore()
  const { setActiveSeamlessAddress } = useSeamlessStore()
  const { client } = useMyxSdkClient(chainId)

  const changeSdkTradeMode = useCallback(
    async (open: boolean) => {
      if (open) {
        const rs = await client?.seamless.startSeamlessMode({ open: true })
        console.log('changeSdkTradeMode-->', rs)
        setTradeMode(TradeMode.Seamless)
        return
      }

      await client?.seamless.startSeamlessMode({ open: false })
      setTradeMode(TradeMode.Classic)
      setActiveSeamlessAddress('')
    },
    [tradeMode, client, setTradeMode, setActiveSeamlessAddress],
  )

  return {
    changeSdkTradeMode,
  }
}
