import { Box } from '@mui/material'
import { usePoolContext } from '@/pages/Cook/hook'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent.tsx'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { formatNumber } from '@/utils/number.ts'
import { Mode } from '@/pages/Cook/type.ts'
import { TradingInfo } from '@/pages/Cook/detail/components/TradingInfo.tsx'
import { ChartInterval } from '@/pages/Earn/type.ts'
import { t } from '@lingui/core/macro'
import { useState } from 'react'
import { AreaCharts } from '@/components/CookDetail/Charts/AreaCharts.tsx'
import clsx from 'clsx'

export const PriceTab = () => {
  const { baseLpDetail, price, poolId, mode } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const resolutionOptions: {
    label: string
    value: ChartInterval
  }[] = [
    { label: t`Day`, value: ChartInterval.day },
    { label: t`Week`, value: ChartInterval.week },
    { label: t`All`, value: ChartInterval.all },
  ]
  const [resolution, setResolution] = useState<ChartInterval>(ChartInterval.day)

  return (
    <Box>
      <Box className={'flex justify-between px-[16px] py-[20px]'}>
        <Box className={'flex-1'}>
          <Box className={'text-[28px] leading-[1] font-[700]'}>
            <span className={mode === Mode.Rise ? 'text-rise' : 'text-fall'}>
              ${formatNumber(price, { showUnit: false })}
            </span>
          </Box>
          <Box
            className={'mt-[2px] flex items-center gap-[10px] text-[12px] leading-[1] font-[500]'}
          >
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

        <div
          className={clsx(
            'flex h-[24px] items-center gap-[0] text-[12px] leading-[1] font-[500] font-medium text-[#9397A3]',
          )}
        >
          {resolutionOptions.map((option) => (
            <div
              key={option.value}
              role="button"
              className={`px-[12px] py-[6px] transition-all ${option.value === resolution ? 'text-green bg-brand-10' : 'text-regular bg-none'}`}
              onClick={() => setResolution(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      </Box>

      <AreaCharts interval={resolution} />

      <TradingInfo />
    </Box>
  )
}
