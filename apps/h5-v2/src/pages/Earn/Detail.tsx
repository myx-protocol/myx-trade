import { Trans } from '@lingui/react/macro'
import { Box, Breadcrumbs, Link, styled } from '@mui/material'
import Container from '@/components/Container.tsx'
import { ArrowRight } from '@/components/Icon'
import { Chart } from '@/pages/Earn/components/Chart.tsx'
import { Introduction } from '@/pages/Earn/components/Introduction.tsx'
import { TradingInfo } from '@/pages/Earn/components/TradingInfo.tsx'
import { TokenInfo } from '@/pages/Earn/components/TokenInfo.tsx'
import { TradingForm } from '@/pages/Earn/components/Trade'
import { BenchWarning } from '@/pages/Earn/components/BenchWarning.tsx'
import { PoolContext } from '@/pages/Earn/context.ts'
import { COMMON_PRICE_DECIMALS, formatUnits, quote as Quote, pool as Pool } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'
import type { QuoteLpDetail } from '@/request/lp/type.ts'
import { getQuoteLPDetail } from '@/request'
import { useParams } from 'react-router-dom'

const StyledBreadcrumbs = styled(Breadcrumbs)`
  &.MuiBreadcrumbs-root {
    .MuiBreadcrumbs-separator {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
`

const Detail = () => {
  const { chainId, poolId } = useParams()
  const { data: quoteLpDetail } = useQuery({
    queryKey: [{ key: 'QuotePoolDetail' }, chainId, poolId],
    queryFn: async () => {
      if (!chainId || !poolId) return {} as QuoteLpDetail
      const response = await getQuoteLPDetail(chainId as unknown as number, poolId)
      if (response.data) {
        return response.data
      }
      return {} as QuoteLpDetail
    },
  })

  const { data: pool } = useQuery({
    queryKey: [{ key: 'pool_detail_by_poolId' }, poolId, chainId],
    queryFn: async () => {
      if (!poolId || !chainId) return undefined
      const result = await Pool.getPoolDetail(+chainId, poolId)

      return result
    },
  })

  const { data: price } = useQuery({
    queryKey: [{ key: 'quoteLpPrice' }, poolId],
    enabled: !!poolId,
    queryFn: async () => {
      if (!poolId || !chainId) return ''
      const result = await Quote.getLpPrice(+chainId, poolId)

      if (result) {
        return formatUnits(result, COMMON_PRICE_DECIMALS)
      }
      return ''
    },
    refetchInterval: 5000,
  })

  return (
    <PoolContext.Provider
      value={{ chainId: Number(chainId), poolId: poolId as string, pool, price, quoteLpDetail }}
    >
      <Container className={'flex !w-[1196px] !min-w-[1196px] flex-col'}>
        <StyledBreadcrumbs
          aria-label="breadcrumb"
          className={'!text-secondary px-[24px] py-[32px] text-[16px] !leading-[1] font-[500]'}
          separator={<ArrowRight size={16} />}
        >
          <Link underline="hover" color="inherit" href="/earn">
            <Trans>Earn</Trans>
          </Link>

          <span className={'text-regular !text-[16px] leading-[1]'}>
            {quoteLpDetail?.mBaseQuoteSymbol || ''}
          </span>
        </StyledBreadcrumbs>

        <Box className={'flex justify-between px-[24px]'}>
          <Box className={'flex w-[680px] flex-col overflow-hidden'}>
            <Chart />
            <Introduction />
          </Box>
          <Box className={'flex w-[400px] flex-col gap-[32px] overflow-hidden'}>
            <TradingForm />
            <BenchWarning />
            <Box className={'flex flex-col gap-[20px]'}>
              <TradingInfo />
              <TokenInfo />
            </Box>
          </Box>
        </Box>
      </Container>
    </PoolContext.Provider>
  )
}

export default Detail
