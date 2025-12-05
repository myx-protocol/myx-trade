import { Trans } from '@lingui/react/macro'
import { Box } from '@mui/material'
import Reverse from '@/components/Icon/set/Reverse.tsx'
import { formatNumberPrecision } from '@/utils/formatNumber.ts'
import { COMMON_BASE_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import { useMemo, useState } from 'react'
import { usePoolContext } from '@/pages/Cook/hook'
import { useExchangeRate } from '@/pages/Cook/hook/rate.ts'
import { isSafeNumber } from '@/utils'
import Big from 'big.js'

enum Direction {
  LpToB = 1,
  BToLp = 2,
}

export const EstRate = () => {
  const { baseLpDetail, pool } = usePoolContext()
  const _rate = useExchangeRate()
  const [direction, setDirection] = useState<Direction>(Direction.LpToB)

  const rate = useMemo(() => {
    if (direction === Direction.LpToB && isSafeNumber(_rate)) {
      return _rate
    }
    if (direction === Direction.BToLp && _rate) {
      return new Big('1').div(new Big(_rate)).toString()
    }
    return ''
  }, [direction, _rate])

  return (
    <div className="mt-[8px] flex h-[18px] items-center justify-between text-[12px] font-normal text-white">
      <div className="flex items-center text-[#848E9C]">
        <p>
          <Trans>Est. Rate</Trans>
        </p>
      </div>
      <Box className={'flex items-center gap-[2px]'}>
        {/*<Refresh size={12} className={'cursor-pointer'} />*/}
        <span>
          1{' '}
          <span className={'text-secondary'}>
            {direction === Direction.LpToB ? baseLpDetail?.mBaseQuoteSymbol : pool?.baseSymbol}
          </span>
        </span>
        <Box
          className={'text-green cursor-pointer px-[3px] py-[2px]'}
          onClick={() =>
            setDirection(direction === Direction.LpToB ? Direction.BToLp : Direction.LpToB)
          }
        >
          <Reverse size={8} />
        </Box>
        <span>
          {formatNumberPrecision(rate, COMMON_BASE_DISPLAY_DECIMALS)}{' '}
          <span className={'text-secondary'}>
            {direction === Direction.LpToB ? pool?.baseSymbol : baseLpDetail?.mBaseQuoteSymbol}
          </span>
        </span>
      </Box>
    </div>
  )
}
