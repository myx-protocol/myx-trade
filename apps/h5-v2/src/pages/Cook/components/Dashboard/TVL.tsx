import { Statistic } from './Statistic.tsx'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getTrenchTvl } from '@/request/dashboard'
import Big from 'big.js'
import { echarts, getAreaChartOptions } from '@/utils/chart.ts'
import type { LpPriceHistory } from '@/request/lp/type.ts'
import { ChartInterval } from '@/pages/Earn/type.ts'

export const TVL = () => {
  const lineRef = useRef<any>(null)
  const echartsRef = useRef<echarts.ECharts | null>(null)

  const { data = [], isLoading } = useQuery({
    queryKey: ['getTrenchTvl'],
    queryFn: async () => {
      const data = await getTrenchTvl()
      return data?.data || []
    },
    refetchInterval: 1000 * 60,
  })
  const totalTvl = useMemo(() => {
    return (data || []).reduce((previousValue, currentValue) => {
      return previousValue.add(currentValue.value || 0)
    }, new Big(0))
  }, [data])

  const setData = useCallback((list: LpPriceHistory[]) => {
    // const startTime = +new Date('2025-11-1 00:00:00') // 起始时间

    const options = getAreaChartOptions(ChartInterval.all, list, {
      grid: {
        top: '4',
        bottom: '4',
        left: '0',
        right: '0',
        show: false,
      },
      tooltip: { show: false },
      xAxis: { type: 'category', show: false },
    })

    if (lineRef.current) {
      if (!echartsRef.current) {
        echartsRef.current = echarts.init(lineRef.current)
      }
      echartsRef.current.setOption(options)
    }
  }, [])

  useEffect(() => {
    if (data) {
      setData(data)
    }
  }, [data, setData])
  return (
    <Statistic title={<Trans>Tvl</Trans>} value={totalTvl.toString()}>
      <Box className={'pointer-events-none h-full w-full'} ref={lineRef}></Box>
    </Statistic>
  )
}
