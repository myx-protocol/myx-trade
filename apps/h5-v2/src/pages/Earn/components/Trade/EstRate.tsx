import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import Reverse from '@/components/Icon/set/Reverse.tsx'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { DescribeItem } from '@/components/Describe.tsx'
import { useContext, useMemo, useState } from 'react'
import { PoolContext } from '@/pages/Earn/context.ts'
import Big from 'big.js'

enum Direction {
  LpToU = 1,
  UToLp = 2,
}

export const EstRate = () => {
  const { quoteLpDetail, pool, exchangeRate } = useContext(PoolContext)
  const [direction, setDirection] = useState<Direction>(Direction.LpToU)

  const rate = useMemo(() => {
    if (direction === Direction.LpToU && exchangeRate) {
      return exchangeRate
    }
    if (direction === Direction.UToLp && exchangeRate) {
      const _rate = new Big(1).div(new Big(exchangeRate)).toFixed(COMMON_BASE_DISPLAY_DECIMALS * 2)
      return formatNumberPrecision(_rate, COMMON_BASE_DISPLAY_DECIMALS)
    }
    return ''
  }, [direction, exchangeRate])

  return (
    <DescribeItem title={<Trans>Est. Rate</Trans>}>
      <Box className={'flex h-[18px] items-center gap-[2px]'}>
        {/*<Refresh size={12} className={'cursor-pointer'} />*/}
        <span>
          1{direction === Direction.LpToU ? quoteLpDetail?.mQuoteBaseSymbol : pool?.quoteSymbol}
        </span>
        <Box
          className={'text-green cursor-pointer px-[3px] py-[2px]'}
          onClick={() =>
            setDirection(direction === Direction.LpToU ? Direction.UToLp : Direction.LpToU)
          }
        >
          <Reverse size={8} />
        </Box>
        <span>
          {formatNumberPrecision(rate, COMMON_BASE_DISPLAY_DECIMALS)}
          {direction === Direction.LpToU ? pool?.quoteSymbol : quoteLpDetail?.mQuoteBaseSymbol}
        </span>
      </Box>
    </DescribeItem>
  )
}
