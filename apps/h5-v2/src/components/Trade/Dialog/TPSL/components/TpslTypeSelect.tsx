import { TpSlTypeEnum } from '@/components/Trade/type'
import { useMemo } from 'react'
import { Trans } from '@lingui/react/macro'
import { TradeSelect, type TradeSelectOption } from '@/components/Trade/components/Select'

interface TPSLTypeSelectDialogProps {
  value: TpSlTypeEnum
  onChange: (value: TpSlTypeEnum) => void
  quoteToken: string
}

export const TpslTypeSelect = ({ quoteToken, value, onChange }: TPSLTypeSelectDialogProps) => {
  const tpslTypeList = useMemo<Array<TradeSelectOption>>(() => {
    return [
      {
        value: TpSlTypeEnum.PRICE,
        label: (
          <>
            <Trans>Price</Trans>
            <span className="ml-[2px]">({quoteToken})</span>
          </>
        ),
        description: <Trans>Set TP/SL trigger prices based on the coin price.</Trans>,
      },
      {
        value: TpSlTypeEnum.ROI,
        label: (
          <>
            <Trans>ROI</Trans>
            <span className="ml-[2px]">(%)</span>
          </>
        ),
        description: <Trans>Set TP/SL trigger prices based on the estimated ROl.</Trans>,
      },
      {
        value: TpSlTypeEnum.Change,
        label: (
          <>
            <Trans>Change</Trans>
            <span className="ml-[2px]">(%)</span>
          </>
        ),
        description: (
          <Trans>Set TP/SL trigger prices based on the percentage change in order price</Trans>
        ),
      },
      {
        value: TpSlTypeEnum.Pnl,
        label: (
          <>
            <Trans>PnL</Trans>
            <span className="ml-[2px]">({quoteToken})</span>
          </>
        ),
        description: <Trans>Set TP/SL trigger prices based on the estimated pnl</Trans>,
      },
    ]
  }, [quoteToken])

  return (
    <TradeSelect
      options={tpslTypeList}
      value={value}
      onChange={(val) => {
        onChange?.(val.target.value as TpSlTypeEnum)
      }}
    ></TradeSelect>
  )
}
