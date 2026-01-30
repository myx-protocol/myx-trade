import { Box } from '@mui/material'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { Trans } from '@lingui/react/macro'
import { usePoolContext } from '@/pages/Cook/hook'
import { Address } from '@/components/Address.tsx'
import dayjs from 'dayjs'
import { formatNumber } from '@/utils/number.ts'
import { useSecurityInfo } from '@/api'
import { SafeList } from '@/components/SafeList'

const SecurityInfo = () => {
  const { baseLpDetail } = usePoolContext()
  const { data: securityInfo } = useSecurityInfo({
    address: baseLpDetail?.baseToken || '',
    chainId: baseLpDetail?.chainId as number,
  })
  if (!securityInfo) return <></>
  return (
    <SafeList
      chainId={baseLpDetail?.chainId as number}
      address={baseLpDetail?.baseToken || ''}
      className={'mt-[20px]'}
      poolId={baseLpDetail?.poolId as string}
    />
  )
}

export const Info = () => {
  const { baseLpDetail } = usePoolContext()
  return (
    <Box className={'px-[16px]'}>
      <Box className={'border-dark-border border-b-1 py-[20px]'}>
        <Describe>
          <DescribeItem title={<Trans>Name</Trans>}>{baseLpDetail?.symbolName}</DescribeItem>

          <DescribeItem title={<Trans>Address</Trans>}>
            <Address address={baseLpDetail?.baseToken || ''} />
          </DescribeItem>

          <DescribeItem title={<Trans>creat time</Trans>}>
            {baseLpDetail?.tokenCreateTime
              ? dayjs(baseLpDetail?.tokenCreateTime * 1000)
                  .utc()
                  .format('YYYY/MM/DD HH:mm:ss')
              : '--'}
          </DescribeItem>

          <DescribeItem title={<Trans>Total supply</Trans>}>
            {baseLpDetail?.totalSupply ? formatNumber(baseLpDetail?.totalSupply) : '--'}
          </DescribeItem>
          <DescribeItem title={<Trans>Circulation</Trans>}>
            {baseLpDetail?.circulation ? formatNumber(baseLpDetail.circulation) : '--'}
          </DescribeItem>
          <DescribeItem title={<Trans>Market cap</Trans>}>
            ${baseLpDetail?.marketCap ? formatNumber(baseLpDetail.marketCap) : '--'}
          </DescribeItem>
          <DescribeItem title={<Trans>FDV</Trans>}>
            ${baseLpDetail?.fdv ? formatNumber(baseLpDetail.fdv) : '--'}
          </DescribeItem>
          <DescribeItem title={<Trans>Holders</Trans>}>
            {formatNumber(baseLpDetail?.holders)}
          </DescribeItem>

          <DescribeItem title={<Trans>Traders</Trans>}>
            {formatNumber(baseLpDetail?.traders)}
          </DescribeItem>

          <DescribeItem title={<Trans>Total Spot liq</Trans>}>
            ${baseLpDetail?.liquidity ? formatNumber(baseLpDetail.liquidity) : '--'}
          </DescribeItem>
        </Describe>
      </Box>

      <SecurityInfo />
    </Box>
  )
}
