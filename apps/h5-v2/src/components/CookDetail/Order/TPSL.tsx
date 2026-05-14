import { TPSLInput } from '@/components/Trade/TradePanel/TPSL/TPSLInput'
import { Trans } from '@lingui/react/macro'
import { useCookOrderStore } from './store'
import { CustomCheckBox } from '@/components/CheckBox.tsx'
import { Box } from '@mui/material'
import { TpSlTypeEnum } from '@/components/Trade/type.ts'
import { useMemo } from 'react'
import { t } from '@lingui/core/macro'

export const CookDetailTPSL = ({
  quoteSymbol,
  className = '',
}: {
  quoteSymbol: string
  className: string
}) => {
  const {
    tpValue,
    tpType,
    setTpValue,
    setTpType,
    slValue,
    slType,
    setSlValue,
    setSlType,
    tpSlOpen,
    setTpSlOpen,
  } = useCookOrderStore()
  const [tpPlaceHolder, slPlaceHolder] = useMemo(() => {
    let tpPlaceHolder = t`TP(${quoteSymbol})`
    let slPlaceHolder = t`SL(${quoteSymbol})`

    const renderPlaceHolder = (type: TpSlTypeEnum, isSL?: boolean) => {
      switch (type) {
        case TpSlTypeEnum.ROI:
          return 'ROI(%)'
        case TpSlTypeEnum.Change:
          return 'Change(%)'
        case TpSlTypeEnum.Pnl:
          return `Pnl(${quoteSymbol})`
        case TpSlTypeEnum.PRICE:
        default:
          return isSL ? slPlaceHolder : tpPlaceHolder
      }
    }

    tpPlaceHolder = renderPlaceHolder(tpType)
    slPlaceHolder = renderPlaceHolder(slType, true)
    return [tpPlaceHolder, slPlaceHolder]
  }, [tpType, slType, quoteSymbol])

  return (
    <div className={`flex flex-col gap-[8px] ${className}`}>
      <Box className={'flex items-center gap-[4px] p-[4px]'}>
        <CustomCheckBox
          type={'normal'}
          label={<Trans>TP/SL</Trans>}
          checked={tpSlOpen}
          onChange={(value: boolean) => {
            setTpSlOpen(value)
          }}
        />

        {/*<Tooltips title={t`When checked, the system will only redeem your regular LP shares.`}>*/}
        {/*  <TipsFill size={14} className={'cursor-pointer'} />*/}
        {/*</Tooltips>*/}
      </Box>

      {tpSlOpen && (
        <div className="flex gap-[8px]">
          <TPSLInput
            type={tpType}
            value={tpValue}
            onChange={setTpValue}
            onTypeChange={setTpType}
            quoteToken={quoteSymbol}
            placeHolder={tpPlaceHolder}
            inputPrefix={tpType === TpSlTypeEnum.PRICE ? '' : '+'}
            inputSuffix={
              tpType === TpSlTypeEnum.ROI || tpType === TpSlTypeEnum.Change ? '%' : undefined
            }
          />
          <TPSLInput
            type={slType}
            value={slValue}
            onChange={setSlValue}
            onTypeChange={setSlType}
            quoteToken={quoteSymbol}
            placeHolder={slPlaceHolder}
            inputPrefix={slType === TpSlTypeEnum.PRICE ? '' : '-'}
            inputSuffix={
              tpType === TpSlTypeEnum.ROI || tpType === TpSlTypeEnum.Change ? '%' : undefined
            }
          />
        </div>
      )}
    </div>
  )
}
