import { Box } from '@mui/material'
import { NoticeFill } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { formatUnits, Market, market as _Market, MarketPoolState } from '@myx-trade/sdk'
import { useQuery } from '@tanstack/react-query'

export const BenchWarning = () => {
  const { quoteLpDetail, pool, chainId } = useContext(PoolContext)
  const { data: fee } = useQuery({
    queryKey: [{ key: 'market_fee_Info' }, chainId, pool?.state],
    queryFn: async () => {
      if (!chainId || pool?.state !== MarketPoolState.Bench) return null
      const result = await _Market.getOracleFee(+chainId, Market[+chainId].marketId)

      return result ? formatUnits(result, Market[+chainId].decimals) : undefined
    },
  })
  if (pool?.state !== MarketPoolState.Bench) return <></>
  return (
    <Box
      className={
        'bg-warning-10 text-regular flex gap-[6px] rounded-[8px] px-[16px] py-[12px] text-[12px] leading-[1.5] font-[500]'
      }
    >
      <Box className={'mt-[2px]'}>
        <NoticeFill size={14} />
      </Box>

      <span className={''}>
        <Trans>
          {quoteLpDetail?.mBaseQuoteSymbol}已退市，您可以赎回您的份额，或支付 {fee}{' '}
          {pool.quoteSymbol}
          重新激活交易！
        </Trans>
        <a href={`/market/${chainId}/${pool.baseToken}`} className={'text-green'}>
          <Trans>去激活</Trans>
        </a>
      </span>
    </Box>
  )
}
