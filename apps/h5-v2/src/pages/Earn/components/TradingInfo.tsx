import CollapsibleCard from '@/components/Collapse'
import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'

export const TradingInfo = () => {
  const { quoteLpDetail } = useContext(PoolContext)
  return (
    <CollapsibleCard title={<Trans>Trading Info</Trans>}>
      <Box className={'flex flex-col gap-[16px]'}>
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>24h Volume</Trans>
          </span>
          <span className={'text-white'}>
            {formatNumberPrecision(quoteLpDetail?.volume, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>

        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Long Positions</Trans>
          </span>
          <span className={'text-white'}>
            ${formatNumberPrecision(quoteLpDetail?.longPosition, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Short Positions</Trans>
          </span>
          <span className={'text-white'}>
            ${formatNumberPrecision(quoteLpDetail?.shortPosition, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Funding Rate</Trans>
          </span>
          <span className={'text-white'}>
            ${formatNumberPrecision(quoteLpDetail?.fundingRate, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
      </Box>
    </CollapsibleCard>
  )
}
