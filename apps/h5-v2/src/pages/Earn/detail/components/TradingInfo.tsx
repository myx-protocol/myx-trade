import CollapsibleCard from '@/components/Collapse.tsx'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { formatNumber } from '@/utils/number.ts'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'

export const TradingInfo = ({ className = '' }: { className?: string }) => {
  const { quoteLpDetail } = useContext(PoolContext)
  return (
    <Box className={`${className}`}>
      <Box className={'mb-[16px] text-[14px] leading-[1] font-[500] text-white'}>
        <Trans>Perp Trading Info</Trans>
      </Box>

      <Describe>
        <DescribeItem title={<Trans>24h Volume</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.volume, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>

        <DescribeItem title={<Trans>Long Positions</Trans>}>
          ${formatNumberPrecision(quoteLpDetail?.longPosition, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>

        <DescribeItem title={<Trans>Short Positions</Trans>}>
          ${formatNumberPrecision(quoteLpDetail?.shortPosition, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>

        <DescribeItem title={<Trans>Funding Rate</Trans>}>
          ${formatNumberPrecision(quoteLpDetail?.fundingRate, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>
      </Describe>
    </Box>
  )
}
