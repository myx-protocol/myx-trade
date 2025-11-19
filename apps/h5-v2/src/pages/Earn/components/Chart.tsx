import { Box, styled, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { ArrowDown, ChartBar } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useCallback, useMemo, useState, useRef, useEffect, useContext } from 'react'
import dayjs from 'dayjs'
import { useQuery } from '@tanstack/react-query'
import { getLpPriceHistory } from '@/request'
import type { LpPriceHistory } from '@/request/lp/type.ts'
import { ChartInterval, ChartIntervalValue } from '@/pages/Earn/type.ts'
import { ChartContext, PoolContext } from '@/pages/Earn/context.ts'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useGlobalSearchStore } from '@/components/GlobalSearch/store.ts'
import { SuspenseLoading } from '@/components/Loading'
import { echarts, getAreaChartOptions } from '@/utils/chart.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { SearchTypeEnum } from '@myx-trade/sdk'

interface ChartProps {
  className?: string
}

const Token = () => {
  const { open: openGlobalSearch } = useGlobalSearchStore()
  const { quoteLpDetail, chainId } = useContext(PoolContext)
  return (
    <Box className={'flex cursor-pointer items-center gap-[12px]'}>
      <Box className={'flex items-center gap-[14px]'}>
        <Box className={'relative h-[32px] w-[32px] min-w-[32px]'}>
          <CoinIcon
            size={32}
            icon={quoteLpDetail?.tokenIcon ?? ''}
            symbol={quoteLpDetail?.mBaseQuoteSymbol}
          />
          <Box
            className={
              'absolute right-[-6px] bottom-0 h-[12px] w-[12px] min-w-[12px] overflow-hidden rounded-full'
            }
          >
            <CoinIcon size={12} icon={CHAIN_INFO?.[chainId]?.logoUrl ?? ''} />
          </Box>
        </Box>
        <Box className={'text-[24px] leading-[1] font-[700] text-white'}>
          {quoteLpDetail?.mBaseQuoteSymbol || '--'}
        </Box>
      </Box>

      <span className={'text-secondary text-[16px] leading-[1] font-[500]'}>
        {quoteLpDetail?.symbolName || '--'}
      </span>

      <ArrowDown
        size={20}
        className={'text-white'}
        onClick={() => {
          openGlobalSearch({
            defaultTab: SearchTypeEnum.Earn,
          })
        }}
      />
    </Box>
  )
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
  &.MuiToggleButtonGroup-root {
    border-radius: 0;
    .MuiToggleButtonGroup-grouped {
      color: var(--regular-text);
      font-weight: 700;
      font-size: 12px;
      line-height: 1;
      padding: 8px 12px;
      border-radius: 4px;
      &.Mui-selected {
        color: var(--brand-green);
        background-color: var(--brand-10);
      }
    }
  }
`
const IntervalSelector = () => {
  const { period: interval, setPeriod: setInterval } = useContext(ChartContext)
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
const ChartHeader = () => {
  const { quoteLpDetail, price } = useContext(PoolContext)
  const [time] = useState<number>(new Date().valueOf())

  /*const { data: price } = useQuery({
    queryKey: [{ key: 'pirce' }, poolId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId) return null
      const result = await getOraclePrice(chainId, [poolId])
      setTime(new Date().valueOf())
      if (result) {
        return result?.data?.[0]?.price
      }
      return
    },
    refetchInterval: 5000,
  })*/

  return (
    <Box className={'flex w-full flex-col'}>
      <Box className={'flex items-center justify-between'}>
        <Token />
        <Box className={'flex items-end gap-[4px]'}>
          <span className={'text-secondary text-[16px] leading-[1] font-[500]'}>
            <Trans>APR</Trans>
          </span>
          <span
            className={`text-[24px] leading-[1] font-[700] ${Number(quoteLpDetail?.apr) > 0 ? 'text-rise' : 'text-fall'}`}
          >
            {quoteLpDetail?.apr ? formatNumberPercent(quoteLpDetail?.apr) : '--'}
          </span>
        </Box>
      </Box>
      <Box className={'mt-[32px] flex w-full items-center justify-between py-[6px]'}>
        <span>
          <Trans>Exchange Rate</Trans>
        </span>
        <IntervalSelector />
      </Box>
      <Box className={'flex flex-col gap-[8px] py-[8px]'}>
        <Box className={'text-[32px] leading-[1] font-[700] text-white'}>
          {price ? formatNumberPrecision(price, COMMON_BASE_DISPLAY_DECIMALS) : '--'}
        </Box>
        <Box
          className={
            'text-secondary flex items-center gap-[4px] text-[14px] leading-[1] font-[500]'
          }
        >
          <span>{dayjs(time).utc().format('MM-DD')}</span>
          <span>{dayjs(time).utc().format('YYYY')}(UTC)</span>
        </Box>
      </Box>
    </Box>
  )
}

export const Chart = ({ className = '' }: ChartProps) => {
  const { chainId, poolId, pool: detail } = useContext(PoolContext)
  const lineRef = useRef<any>(null)
  const echartsRef = useRef<echarts.ECharts | null>(null)
  const [interval, setInterval] = useState<ChartInterval>(ChartInterval.all)

  const { data = [], isLoading } = useQuery({
    queryKey: [{ key: 'QuotePriceHistory' }, chainId, poolId, detail?.quotePoolToken, interval],
    // enabled: !!detail?.quoteToken && chainId && poolId,
    queryFn: async () => {
      if (!chainId || !poolId || !detail?.quotePoolToken) {
        return [] as LpPriceHistory[]
      }
      const result = await getLpPriceHistory({
        chainId: Number(chainId as unknown as number),
        poolId,
        token: detail.quotePoolToken,
        interval: ChartIntervalValue[interval].value,
        limit: ChartIntervalValue[interval].limit,
      })
      return result?.data || []
    },
  })

  const setData = useCallback(
    (list: LpPriceHistory[]) => {
      // const startTime = +new Date('2025-11-1 00:00:00') // 起始时间

      const options = getAreaChartOptions(interval, list)

      if (lineRef.current) {
        if (!echartsRef.current) {
          echartsRef.current = echarts.init(lineRef.current)
        }
        echartsRef.current.setOption(options)
      }
    },
    [interval],
  )

  useEffect(() => {
    if (data) {
      console.log(data)
      setData(data)
    }
  }, [data, setData])
  return (
    <ChartContext.Provider value={{ period: interval as ChartInterval, setPeriod: setInterval }}>
      <Box
        className={`border-dark-border flex h-[430px] w-full flex-col border-b-1 pb-[48px] ${className}`}
      >
        <ChartHeader />
        <Box className={'relative flex-1'}>
          <Box className={'h-full w-full'} ref={lineRef}></Box>

          {!isLoading && data.length === 0 && (
            <Box
              className={
                'bg-deep absolute top-[0] left-[0] z-[10] flex h-full w-full flex-col items-center justify-center py-[58px]'
              }
            >
              <Box className={'text-dark-border'}>
                <ChartBar size={56} />
              </Box>
              <p className={'text-secondary mt-[16px] text-[12px] leading-[1] font-[500]'}>
                <Trans>No records found</Trans>
              </p>
            </Box>
          )}

          {isLoading && (
            <Box
              className={
                'bg-deep absolute top-[0] left-[0] z-[20] flex h-full w-full items-center justify-center'
              }
            >
              <SuspenseLoading />
            </Box>
          )}
        </Box>
      </Box>
    </ChartContext.Provider>
  )
}
