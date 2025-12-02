import { DescribeItem } from '@/components/Describe'
import { TipsOutLine } from '@/components/Icon'
import { formatNumberPercent } from '@/utils/formatNumber'
import { Trans } from '@lingui/react/macro'
import { Box, styled } from '@mui/material'
import { COMMON_PERCENT_DISPLAY_DECIMALS } from '@/constant/decimals.ts'
import EditSimply from '@/components/Icon/set/EditSimply.tsx'
import { useCallback, useState } from 'react'
import { NumericInputWithAdornment } from '@/pages/Earn/components/Trade/NumericInput.tsx'
import { isSafeNumber } from '@/utils'
import { MAX_SLIPPING_PERCENT, MIN_SLIPPING_PERCENT } from '@/constant/slippage.ts'
import Yes from '@/components/Icon/set/Yes.tsx'
import { Tooltips } from '@/components/UI/Tooltips'
import { t } from '@lingui/core/macro'

const StyledNumericInputWithAdornment = styled(NumericInputWithAdornment)`
  .MuiInputBase-root {
    font-size: 12px;
    padding: 2px 0;
    height: 18px;
  }
  & .MuiInputBase-input {
    height: 18px;
    line-height: 14px;
  }

  & .MuiInputAdornment-root {
    margin-left: 2px;
    color: var(--regular-text);
  }
`

export const PriceImpact = ({
  slippage,
  setSlippage,
}: {
  slippage: string
  setSlippage: (slippage: string) => void
}) => {
  const [isEdit, setIsEdit] = useState<boolean>(false)
  const [value, setValue] = useState<string>('')
  const onValueChange = useCallback(
    ({ floatValue, value }: { value: string; floatValue?: number }) => {
      setValue(value)

      if (isSafeNumber(floatValue)) {
        const num =
          Number(floatValue) > MAX_SLIPPING_PERCENT
            ? MAX_SLIPPING_PERCENT
            : Number(floatValue) < MIN_SLIPPING_PERCENT
              ? MIN_SLIPPING_PERCENT
              : Number(floatValue)
        setSlippage((num / 100).toString())
      }
    },
    [setValue, setSlippage],
  )
  return (
    <DescribeItem
      title={
        <span className={'text-Secondary flex items-center gap-[4px] text-[12px] leading-[1]'}>
          <Trans>Price Impact</Trans>
          <Tooltips
            title={t`The estimated deviation of your execution price from the current market price.`}
          >
            <TipsOutLine size={12} className={'cursor-pointer'} />
          </Tooltips>
        </span>
      }
    >
      <Box
        className={
          'text-regular flex h-[18px] flex-1 cursor-pointer items-center justify-end gap-[2px]'
        }
      >
        {!isEdit ? (
          <>
            <span className={'text-regular text-[12px] leading-[1] font-[500]'}>
              {formatNumberPercent(slippage, COMMON_PERCENT_DISPLAY_DECIMALS, false)}
            </span>
            <EditSimply
              className={'cursor-pointer text-white'}
              size={12}
              onClick={() => {
                setValue(isSafeNumber(slippage) ? formatNumberPercent(slippage) : '')
                setIsEdit(true)
              }}
            />
          </>
        ) : (
          <>
            <StyledNumericInputWithAdornment
              className={''}
              autoFocus
              size="small"
              textAlign="right"
              width={100}
              value={value}
              min={MIN_SLIPPING_PERCENT}
              max={MAX_SLIPPING_PERCENT}
              endAdornment="%"
              onValueChange={onValueChange}
              onBlur={() => setIsEdit(false)}
            />

            <Yes
              className={'text-green cursor-pointer'}
              size={12}
              onClick={() => setIsEdit(false)}
            />
          </>
        )}
      </Box>
    </DescribeItem>
  )
}
