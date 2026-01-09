import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { decimalToPercent, formatNumber } from '@/utils/number.ts'
import { isSafeNumber } from '@/utils'
import Big from 'big.js'

export const TradingInfo = ({ className = '' }: { className?: string }) => {
  const { quoteLpDetail, fundingRate } = useContext(PoolContext)
  return (
    <Box className={`${className}`}>
      <Box className={'mb-[16px] text-[14px] leading-[1] font-[500] text-white'}>
        <Trans>Perp Trading Info</Trans>
      </Box>

      <Describe>
        <DescribeItem title={<Trans>24h Volume</Trans>}>
          {formatNumber(quoteLpDetail?.volume)}
        </DescribeItem>

        <DescribeItem title={<Trans>Long Positions</Trans>}>
          ${formatNumber(quoteLpDetail?.longPosition)}
        </DescribeItem>

        <DescribeItem title={<Trans>Short Positions</Trans>}>
          ${formatNumber(quoteLpDetail?.shortPosition)}
        </DescribeItem>

        <DescribeItem title={<Trans>Funding Rate</Trans>}>
          {isSafeNumber(fundingRate)
            ? decimalToPercent(new Big(fundingRate || '0'), {
                showSign: false,
              })
            : '--'}
        </DescribeItem>
      </Describe>
    </Box>
  )
}
