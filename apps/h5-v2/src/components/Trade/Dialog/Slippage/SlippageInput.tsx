import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { useCallback } from 'react'

interface SlippageInputProps {
  defaultValue: number
  value: string
  onChange: (value: string) => void
  maxSlippage: number
}
export const SlippageInput = ({
  defaultValue,
  value,
  onChange,
  maxSlippage,
}: SlippageInputProps) => {
  const onValueChange = useCallback(
    ({ value }: { value: string }) => {
      onChange(value)
    },
    [onChange],
  )
  return (
    <div className="flex w-full items-center gap-[4px]">
      <div className="flex flex-1 items-center justify-between gap-[12px] rounded-[6px] border border-[#202129] bg-[#202129] px-[12px] py-[16px]">
        <div className="flex flex-1 items-center gap-[4px]">
          <NumberInputPrimitive
            max={maxSlippage}
            min={0.01}
            className="text-left text-[12px] font-medium"
            value={value.toString()}
            decimalScale={2}
            onValueChange={onValueChange}
            placeholder={t`最大滑点`}
          />
          <span className="text-[12px] font-medium text-white">%</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-[12px] rounded-[6px] border border-[#202129] px-[12px] py-[16px]">
        <p className="text-center">
          <Trans>
            预估 <span className="ml-[4px]">{defaultValue}%</span>
          </Trans>
        </p>
      </div>
    </div>
  )
}
