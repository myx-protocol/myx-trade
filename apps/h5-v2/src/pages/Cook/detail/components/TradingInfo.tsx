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
  const { baseLpDetail, poolId, fundingRate } = usePoolContext()
  const tickerData = useMarketStore((state) => state.tickerData[poolId || ''])

  return (
    <Box className={'mt-[16px] px-[16px] py-[12px]'}>
      <Box className={'mb-[16px] text-[14px] leading-[1] font-[500] text-white'}>
        <Trans>Perp Trading Info</Trans>
      </Box>

      <Describe>
        <DescribeItem title={<Trans>24h Volume</Trans>}>
          {baseLpDetail?.volume ? formatNumber(Number(baseLpDetail?.volume)) : '--'}
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
        </DescribeItem>

        <DescribeItem
          title={
            <Tooltips title={t`Underlying Price`}>
              <span className={'border-secondary border-b-[1px] border-dashed select-none'}>
                <Trans>Underlying Price</Trans>
              </span>
            </Tooltips>
          }
        >
          $
          {tickerData?.price
            ? formatNumber(tickerData?.price, {
                showUnit: false,
              })
            : '--'}
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
          {baseLpDetail?.tvl
            ? formatNumber(baseLpDetail?.tvl, {
                showUnit: false,
              })
            : '--'}
        </DescribeItem>
      </Describe>
    </Box>
  )
}
