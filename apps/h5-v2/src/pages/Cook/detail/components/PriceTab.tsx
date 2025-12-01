import { Box } from '@mui/material'
import { Charts } from '@/components/CookDetail/Charts'
import { usePoolContext } from '@/pages/Cook/hook'
import { Change } from '@/components/Change.tsx'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent.tsx'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { formatNumber } from '@/utils/number.ts'
import { Mode } from '@/pages/Cook/type.ts'
import { TradingInfo } from '@/pages/Cook/detail/components/TradingInfo.tsx'

export const PriceTab = () => {
  const { baseLpDetail, price, poolId, mode } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  return (
    <Box>
      <Box className={'p-[16px]'}>
        <Box className={'text-[28px] leading-[1] font-[700]'}>
          <span className={mode === Mode.Rise ? 'text-rise' : 'text-fall'}>
            ${formatNumberPrecision(price, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
        <Box className={'mt-[2px] flex items-center gap-[10px] text-[12px] leading-[1] font-[500]'}>
          <span className={'text-regular'}>
            $
            {tickerData?.price
              ? formatNumber(tickerData?.price, {
                  showUnit: false,
                })
              : '--'}
          </span>
          <RiseFallTextPrecent value={Number(baseLpDetail?.lpPriceChange)} />
        </Box>
      </Box>
      <Charts />

      <TradingInfo />
    </Box>
  )
}
