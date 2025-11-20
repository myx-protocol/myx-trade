import { useMemo } from 'react'
import { usePoolContext } from '@/pages/Cook/hook/index.ts'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import Big from 'big.js'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'

export const useExchangeRate = () => {
  const { poolId, price } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const rate = useMemo(() => {
    if (price && tickerData?.price) {
      const _rate = new Big(price).div(new Big(tickerData?.price))
      const result = _rate.toString()
      // console.log(price, tickerData?.price, _rate, result)
      return result
    }
    return ''
  }, [price, tickerData?.price])
  return rate
}
