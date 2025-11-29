import EChartsReact from 'echarts-for-react'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usePoolContext } from '@/pages/Cook/hook'
import type { LpPriceHistory } from '@/request/lp/type.ts'
import { getLpPriceHistory } from '@/request'
import { ChartInterval, ChartIntervalValue } from '@/pages/Earn/type.ts'
import { Box } from '@mui/material'
import { SuspenseLoading } from '@/components/Loading'
import { ChartBar } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { getAreaChartOptions } from '@/utils/chart.ts'

export const AreaCharts = ({ interval }: { interval: ChartInterval }) => {
  const { chainId, poolId, pool } = usePoolContext()
  const {
    data = [],
    isLoading,
    isPending,
  } = useQuery({
    queryKey: [{ key: 'BasePoolPriceHistory' }, chainId, poolId, pool?.basePoolToken, interval],
    queryFn: async () => {
      if (!chainId || !poolId || !pool?.basePoolToken) return [] as LpPriceHistory[]
      const result = await getLpPriceHistory({
        chainId: Number(chainId as unknown as number),
        poolId,
        token: pool.basePoolToken,
        interval: ChartIntervalValue[interval].value,
        limit: ChartIntervalValue[interval].limit,
      })
      return result?.data || []
    },
  })

  const option = useMemo(
    () =>
      getAreaChartOptions(interval, data, {
        grid: {
          bottom: '24px',
          left: '0',
          right: '0',
          show: false,
        },
      }),
    [data, interval],
  )

  return (
    <div className="relative px-[10px]">
      <EChartsReact option={option} className="h-[280px]" />

      {isLoading && (
        <Box
          className={
            'absolute top-[0] left-[0] z-[10] flex h-full w-full items-center justify-center'
          }
        >
          <SuspenseLoading />
        </Box>
      )}

      {data.length === 0 && isPending && (
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
    </div>
  )
}
