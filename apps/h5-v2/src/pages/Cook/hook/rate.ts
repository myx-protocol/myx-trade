import { useMemo } from 'react'
import { usePoolContext } from '@/pages/Cook/hook/index.ts'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import Big from 'big.js'

export const useExchangeRate = () => {
  const { exchangeRate } = usePoolContext()

  const rate = useMemo(() => {
    if (exchangeRate) {
      const _rate = new Big(1).div(new Big(exchangeRate))
      const result = _rate.toString()
      // console.log(price, tickerData?.price, _rate, result)
      return result
    }
    return ''
  }, [exchangeRate])
  return rate
}
