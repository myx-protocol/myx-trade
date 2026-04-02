import { Box, styled, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { usePoolContext } from '@/pages/Cook/hook'
import { RiseFallTextPrecent } from '@/components/RiseFallText/RiseFallTextPrecent.tsx'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { formatNumber } from '@/utils/number.ts'
import { Mode } from '@/pages/Cook/type.ts'
import { TradingInfo } from '@/pages/Cook/detail/components/TradingInfo.tsx'
import { ChartInterval, ChartType } from '@/pages/Earn/type.ts'
import { t } from '@lingui/core/macro'
import { useCallback, useMemo, useState } from 'react'
import { AreaCharts } from '@/components/CookDetail/Charts/AreaCharts.tsx'
import { Trans } from '@lingui/react/macro'

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  &.MuiToggleButtonGroup-root {
    border-radius: 0;
    border: 1px solid #292b33;
    gap: 0px;
    padding: 4px;
    border-radius: 9999px;
    .MuiToggleButtonGroup-grouped {
      color: var(--regular-text);
      border-radius: 9999px;
      font-weight: 500;
      font-size: 12px;
      line-height: 1;
      padding: 4px 8px;
      &.Mui-selected {
        color: var(--brand-green);
        background-color: var(--brand-10);
      }
    }
  }
`

interface IntervalSelectorProps {
  interval: ChartInterval
  setInterval: (interval: ChartInterval) => void
}
const IntervalSelector = ({ interval, setInterval }: IntervalSelectorProps) => {
  const handleChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newInterval: ChartInterval | null) => {
      setInterval(newInterval as ChartInterval)
    },
    [setInterval],
  )

  const options = useMemo(() => {
    return [
      {
        label: <Trans>Day</Trans>,
        value: ChartInterval.day,
      },
      {
        label: <Trans>Week</Trans>,
        value: ChartInterval.week,
      },
      {
        label: <Trans>All</Trans>,
        value: ChartInterval.all,
      },
    ]
  }, [])
  return (
    <StyledToggleButtonGroup
      value={interval}
      exclusive
      onChange={handleChange}
      aria-label="chart interval"
    >
      {options.map((option, index) => {
        return (
          <ToggleButton key={index} value={option.value}>
            {option.label}
          </ToggleButton>
        )
      })}
    </StyledToggleButtonGroup>
  )
}

const StyledChartTypeToggleButton = styled(StyledToggleButtonGroup)`
  &.MuiToggleButtonGroup-root {
    .MuiToggleButtonGroup-grouped {
      color: var(--secondary-text);
    }
  }
`

interface ChartTypeSelectorProps {
  chartType: ChartType
  setChartType: (chartType: ChartType) => void
}
const ChartTypeSelector = ({ chartType, setChartType }: ChartTypeSelectorProps) => {
  const handleChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, chartType: ChartType | null) => {
      setChartType(chartType as ChartType)
    },
    [setChartType],
  )

  const options = useMemo(() => {
    return [
      {
        label: <Trans>Price</Trans>,
        value: ChartType.Price,
      },
      {
        label: <Trans>TVL</Trans>,
        value: ChartType.TVL,
      },
    ]
  }, [])
  return (
    <StyledChartTypeToggleButton
      value={chartType}
      exclusive
      onChange={handleChange}
      aria-label="chart type"
    >
      {options.map((option, index) => {
        return (
          <ToggleButton key={index} value={option.value}>
            {option.label}
          </ToggleButton>
        )
      })}
    </StyledChartTypeToggleButton>
  )
}

export const PriceTab = () => {
  const { baseLpDetail, price, poolId, mode, oraclePrice } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  const [resolution, setResolution] = useState<ChartInterval>(ChartInterval.day)
  const [chartType, setChartType] = useState<ChartType>(ChartType.Price)
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
              {formatNumber(tickerData?.price || oraclePrice, {
                showUnit: false,
              })}
            </span>
            <RiseFallTextPrecent value={Number(baseLpDetail?.lpPriceChange)} />
          </Box>
        </Box>
      </Box>

      <AreaCharts interval={resolution} chartType={chartType} />
      <div className="flex items-center justify-between p-[16px]">
        <IntervalSelector interval={resolution} setInterval={setResolution} />
        <ChartTypeSelector chartType={chartType} setChartType={setChartType} />
      </div>

      <TradingInfo />
    </Box>
  )
}
