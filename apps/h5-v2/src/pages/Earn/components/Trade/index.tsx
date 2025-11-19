import { Box } from '@mui/material'
import { TradeTabBar } from '@/pages/Earn/components/Trade/Tab.tsx'
import { Subscribe } from './Subscribe'
import { Redeem } from './Redeem'
import { TradeContext, TradeSide } from '@/pages/Earn/components/Trade/Context.ts'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export const TradingForm = () => {
  const [searchParams] = useSearchParams()
  const [side, setSide] = useState<TradeSide>(TradeSide.Subscribe)
  const [slippage, setSlippage] = useState('0.01')

  useEffect(() => {
    if (searchParams) {
      const side = searchParams?.get('side')
      if (side) {
        setSide(+side as unknown as TradeSide)
      }
    }
  }, [searchParams])
  return (
    <TradeContext.Provider value={{ side, setSide, slippage, setSlippage }}>
      <Box className={'flex flex-col'}>
        <TradeTabBar />
        {side === TradeSide.Subscribe ? <Subscribe /> : <Redeem />}
      </Box>
    </TradeContext.Provider>
  )
}
