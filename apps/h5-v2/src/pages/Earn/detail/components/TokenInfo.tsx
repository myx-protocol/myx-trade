import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import CollapsibleCard from '@/components/Collapse.tsx'
import { Copy } from '@/components/Copy.tsx'
import { useContext } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import { getTimeDiff } from '@/utils/date.ts'
import { formatNumberPercent, formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_PRICE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import type { Token } from '@/pages/Cook/type.ts'
import { CoinIcon } from '@/components/UI/CoinIcon'
import { Skeleton } from '@/components/UI/Skeleton'
import { CHAIN_INFO } from '@/config/chainInfo.ts'
import { encryptionAddress } from '@/utils'
import { Collapse } from '@/components/Trade/components/Collapse'
import { FlexRowLayout } from '@/components/FlexRowLayout'
import { formatNumber } from '@/utils/number.ts'
import { Describe, DescribeItem } from '@/components/Describe.tsx'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'
import { Address } from '@/components/Address.tsx'
import dayjs from 'dayjs'

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
          {dayjs(quoteLpDetail?.tokenCreateTime).utc().format('YYYY/MM/DD HH:mm:ss')}
        </DescribeItem>

        <DescribeItem title={<Trans>Total supply</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.totalSupply, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>
        <DescribeItem title={<Trans>Circulation</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.circulation, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>
        <DescribeItem title={<Trans>Market cap</Trans>}>
          ${formatNumberPrecision(quoteLpDetail?.marketCap, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>
        <DescribeItem title={<Trans>FDV</Trans>}>
          ${formatNumberPrecision(quoteLpDetail?.fdv, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>
        <DescribeItem title={<Trans>Holders</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.holders, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>

        <DescribeItem title={<Trans>Traders</Trans>}>
          {formatNumberPrecision(quoteLpDetail?.traders, 0)}
        </DescribeItem>

        <DescribeItem title={<Trans>Total Spot liq</Trans>}>
          ${formatNumberPrecision(quoteLpDetail?.liquidity, COMMON_PRICE_DISPLAY_DECIMALS)}
        </DescribeItem>
      </Describe>
    </Box>
  )
}
