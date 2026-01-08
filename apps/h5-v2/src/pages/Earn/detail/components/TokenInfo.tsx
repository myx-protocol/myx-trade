import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { Address } from '@/components/Address.tsx'
import dayjs from 'dayjs'
import { formatNumber } from '@/utils/number.ts'

export const TokenInfo = ({ className = '' }: { className?: string }) => {
  const { pool, quoteLpDetail } = useContext(PoolContext)
  return (
    <Box className={`${className}`}>
      <Describe>
        {/*<DescribeItem title={<Trans>Name</Trans>}>{baseLpDetail?.symbolName}</DescribeItem>*/}

        <DescribeItem title={<Trans>Address</Trans>}>
          <Address address={pool?.baseToken || ''} />
        </DescribeItem>

        <DescribeItem title={<Trans>creat time</Trans>}>
          {quoteLpDetail?.tokenCreateTime
            ? dayjs(quoteLpDetail?.tokenCreateTime * 1000)
                .utc()
                .format('YYYY/MM/DD HH:mm:ss')
            : '--'}
        </DescribeItem>

        <DescribeItem title={<Trans>Total supply</Trans>}>
          {formatNumber(quoteLpDetail?.totalSupply)}
        </DescribeItem>
        <DescribeItem title={<Trans>Circulation</Trans>}>
          {formatNumber(quoteLpDetail?.circulation)}
        </DescribeItem>
        <DescribeItem title={<Trans>Market cap</Trans>}>
          ${formatNumber(quoteLpDetail?.marketCap)}
        </DescribeItem>
        <DescribeItem title={<Trans>FDV</Trans>}>${formatNumber(quoteLpDetail?.fdv)}</DescribeItem>
        <DescribeItem title={<Trans>Holders</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.holders, 0)}
        </DescribeItem>

        <DescribeItem title={<Trans>Traders</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.traders, 0)}
        </DescribeItem>

        <DescribeItem title={<Trans>Total Spot liq</Trans>}>
          ${formatNumber(quoteLpDetail?.liquidity)}
        </DescribeItem>
      </Describe>
    </Box>
  )
}
