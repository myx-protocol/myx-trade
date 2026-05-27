import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import clsx from 'clsx'
import { useState } from 'react'
import { TpSlTypeEnum } from '../../type'
import { Trans } from '@lingui/react/macro'
import { TPSLTypeSelectDialog } from '../../Dialog/TpslTypeSelect'
import SortDownIcon from '@/components/Icon/set/SortDown'

export const TPSLInput = ({
  type,
  value,
  onChange,
  onTypeChange,
  placeHolder,
  quoteToken,
  inputPrefix,
  inputSuffix,
  className: classNameProp,
  allowNegative = true,
  source = 'trade',
  onBlur,
}: {
  value: string
  type: TpSlTypeEnum
  onChange: (value: string) => void
  onTypeChange: (type: TpSlTypeEnum) => void
  placeHolder?: string
  quoteToken: string
  inputPrefix?: string
  inputSuffix?: string
  className?: string
  allowNegative?: boolean
  source?: 'trade' | 'lp'
  onBlur?: () => void
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const renderTPSLType = () => {
    switch (type) {
      case TpSlTypeEnum.ROI:
        return <Trans>ROI</Trans>
      case TpSlTypeEnum.Change:
        return <Trans>Change</Trans>
      case TpSlTypeEnum.Pnl:
        return <Trans>PnL</Trans>
      case TpSlTypeEnum.PRICE:
      default:
        return <Trans>Price</Trans>
    }
  }

  const renderInputSuffix = () => {
    switch (type) {
      case TpSlTypeEnum.ROI:
        return '%'
      case TpSlTypeEnum.Change:
        return '%'
      case TpSlTypeEnum.Pnl:
        return `${quoteToken}`
      case TpSlTypeEnum.PRICE:
        return ''
      default:
        return `${quoteToken}`
    }
  }
  return (
    <div
      className={clsx(
        'flex h-[44px] w-full items-center gap-[4px] rounded-[8px] px-[12px]',
        isFocused
          ? 'border-[0.5px] border-white bg-[#18191F] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.8)]'
          : 'border-[0.5px] border-transparent bg-[#202129]',
        classNameProp,
      )}
    >
      <NumberInputPrimitive
        className="text-[12px] font-medium"
        placeholder={placeHolder ?? ''}
        value={value}
        inputMode="text"
        allowLeadingZeros
        allowNegative={
          source === 'trade'
            ? type === TpSlTypeEnum.ROI || type === TpSlTypeEnum.Change || type === TpSlTypeEnum.Pnl
            : allowNegative
        }
        decimalScale={6}
        onValueChange={(values) => {
          // Change 和 ROI 最小不能小于 -100%
          const isRateType = type === TpSlTypeEnum.ROI || type === TpSlTypeEnum.Change
          const floatValue = values.floatValue ?? 0

          if (isRateType && floatValue < -100) {
            onChange('-100')
          } else {
            onChange(values.value ?? '')
          }
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          onBlur?.()
        }}
        prefix={inputPrefix}
        suffix={source === 'trade' ? renderInputSuffix() : inputSuffix}
      />
      <div
        className="flex flex-shrink-0 items-center gap-[4px]"
        role="button"
        onClick={() => setOpen(true)}
      >
        <p className="text-[12px] font-medium text-white">{renderTPSLType()}</p>
        <span className="inline-flex">
          <SortDownIcon size={6} color="#848E9C" />
        </span>
      </div>
      <TPSLTypeSelectDialog
        quoteToken={quoteToken}
        open={open}
        onClose={() => setOpen(false)}
        value={type}
        onChange={onTypeChange}
      />
    </div>
  )
}
