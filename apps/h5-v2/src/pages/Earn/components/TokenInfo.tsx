import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import CollapsibleCard from '@/components/Collapse.tsx'
import { Copy } from '@/components/Copy.tsx'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { getTimeDiff } from '@/utils/date.ts'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'

export const TokenInfo = () => {
  const { pool, quoteLpDetail } = useContext(PoolContext)
  return (
    <CollapsibleCard title={<Trans>Token Info</Trans>}>
      <Box className={'flex flex-col gap-[16px]'}>
        <Box className={'flex items-center justify-between'}>
          <Box className={'flex items-center gap-[4px]'}>
            <span className={'font-[500] text-white'}>{pool?.baseSymbol}</span>
            <Box className={'h-[14px] w-[14px] overflow-hidden rounded-full'}>
              <img src={quoteLpDetail?.tokenIcon} alt={pool?.baseSymbol} />
            </Box>
            <Box className={'bg-base rounded-[20px] px-[6px] py-[4px] font-[500]'}>
              {' '}
              {getTimeDiff(quoteLpDetail?.tokenCreateTime as number)}
            </Box>
          </Box>
          <Copy content={pool?.baseToken || ''} />
        </Box>
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Total Supply</Trans>
          </span>
          <span className={'text-white'}>
            {formatNumberPrecision(quoteLpDetail?.totalSupply, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>

        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Circulation</Trans>
          </span>
          <span className={'text-white'}>
            {formatNumberPrecision(quoteLpDetail?.circulation, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Market Cap</Trans>
          </span>
          <span className={'text-white'}>
            ${formatNumberPrecision(quoteLpDetail?.marketCap, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>FDV</Trans>
          </span>
          <span className={'text-white'}>
            ${formatNumberPrecision(quoteLpDetail?.fdv, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>

        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Holders</Trans>
          </span>
          <span className={'text-white'}>
            {formatNumberPrecision(quoteLpDetail?.holders, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>

        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Traders</Trans>
          </span>
          <span className={'text-white'}>
            {formatNumberPrecision(quoteLpDetail?.traders, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>

        <Box className={'flex items-center justify-between'}>
          <span className={'text-secondary'}>
            <Trans>Total Spot liq</Trans>
          </span>
          <span className={'text-white'}>
            ${formatNumberPrecision(quoteLpDetail?.liquidity, COMMON_PRICE_DISPLAY_DECIMALS)}
          </span>
        </Box>
      </Box>
    </CollapsibleCard>
  )
}
