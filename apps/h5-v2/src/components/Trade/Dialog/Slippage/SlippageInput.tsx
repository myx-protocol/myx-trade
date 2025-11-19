import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { useCallback } from 'react'

interface SlippageInputProps {
  defaultValue: number
  value: number
  onChange: (value: number) => void
  maxSlippage: number
}
export const SlippageInput = ({
  defaultValue,
  value,
  onChange,
  maxSlippage,
}: SlippageInputProps) => {
  const onValueChange = useCallback(
    ({ floatValue }: { floatValue?: number; value: string }) => {
      onChange(floatValue ?? defaultValue ?? 0)
    },
    [onChange, defaultValue],
  )
  return (
    <div className="flex w-full items-center justify-between gap-[12px] rounded-[6px] bg-[#202129] px-[12px] py-[16px]">
      <p className="text-green flex-shrink-0" role="button">
        <Trans>自动{defaultValue}%</Trans>
      </p>
      <div className="flex-grow-[1]">
        <NumberInputPrimitive
          suffix="%"
          max={maxSlippage}
          className="text-right text-[12px] font-medium"
          value={value.toString()}
          onValueChange={onValueChange}
          placeholder="1%-10%"
        />
      </div>
    </div>
  )
}
