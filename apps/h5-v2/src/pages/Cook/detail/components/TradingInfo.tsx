import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { Trans } from '@lingui/react/macro'
import { usePoolContext } from '@/pages/Cook/hook'
import { Box } from '@mui/material'
import { decimalToPercent, formatNumber } from '@/utils/number.ts'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { useMarketStore } from '@/components/Trade/store/MarketStore.tsx'
import { isSafeNumber } from '@/utils'
import Big from 'big.js'

export const TradingInfo = () => {
  const { baseLpDetail, poolId, fundingRate, tvl, oraclePrice } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  return (
    <Box className={'mt-[16px] px-[16px] py-[12px]'}>
      <Box className={'mb-[16px] text-[14px] leading-[1] font-[500] text-white'}>
        <Trans>Perp Trading Info</Trans>
      </Box>

      <Describe>
        <DescribeItem title={<Trans>24h Volume</Trans>}>
          ${baseLpDetail?.volume ? formatNumber(Number(baseLpDetail?.volume)) : '--'}
        </DescribeItem>

        <DescribeItem title={<Trans>Long Positions</Trans>}>
          ${formatNumber(baseLpDetail?.longPosition)}
        </DescribeItem>

        <DescribeItem title={<Trans>Short Positions</Trans>}>
          ${formatNumber(baseLpDetail?.shortPosition)}
        </DescribeItem>

        <DescribeItem title={<Trans>Funding Rate</Trans>}>
          {isSafeNumber(fundingRate)
            ? decimalToPercent(new Big(fundingRate || '0'), {
                showSign: false,
              })
            : '--'}
          /h
        </DescribeItem>

        <DescribeItem
          title={
            <Tooltips title={t`Underlying Price`}>
              <span className={'border-secondary border-b-[1px] border-dashed select-none'}>
                <Trans>Oracle Price</Trans>
              </span>
            </Tooltips>
          }
        >
          $
          {formatNumber(tickerData?.price || oraclePrice, {
            showUnit: false,
          })}
        </DescribeItem>

        <DescribeItem
          title={
            <Tooltips title={t`TVL`}>
              <span className={'border-secondary border-b-[1px] border-dashed select-none'}>
                <Trans>TVL</Trans>
              </span>
            </Tooltips>
          }
        >
          $
          {tvl?.baseTvl
            ? formatNumber(tvl.baseTvl, {
                showUnit: false,
              })
            : '--'}
        </DescribeItem>

        <DescribeItem title={<Trans>Holders</Trans>}>
          {formatNumber(baseLpDetail?.holders)}
        </DescribeItem>

        <DescribeItem title={<Trans>Traders</Trans>}>
          {formatNumber(baseLpDetail?.traders)}
        </DescribeItem>
      </Describe>
    </Box>
  )
}
