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
}: {
  value: number
  type: TpSlTypeEnum
  onChange: (value: number) => void
  onTypeChange: (type: TpSlTypeEnum) => void
  placeHolder?: string
  quoteToken: string
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
  return (
    <div
      className={clsx(
        'flex w-[100%] gap-[4px]',
        'rounded-[8px] border-[1px] border-[#18191F] bg-[#18191F] px-[12px] py-[16px] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.2)]',
        isFocused && 'border-[#fff]',
      )}
    >
      <NumberInputPrimitive
        className="text-[12px] font-medium"
        placeholder={placeHolder ?? ''}
        value={value}
        onValueChange={(values) => {
          onChange(values.floatValue ?? 0)
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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
      {/* <TradeSelect
        value={type}
        onChange={(value) => onTypeChange(value.target.value as TpSlTypeEnum)}
        options={[
          {
            label: <Trans>Price</Trans>,
            value: TpSlTypeEnum.PRICE,
          },
          {
            label: <Trans>ROI</Trans>,
            value: TpSlTypeEnum.ROI,
          },
          {
            label: <Trans>Change</Trans>,
            value: TpSlTypeEnum.Change,
          },
          {
            label: <Trans>PnL</Trans>,
            value: TpSlTypeEnum.Pnl,
          },
        ]}
      /> */}
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
