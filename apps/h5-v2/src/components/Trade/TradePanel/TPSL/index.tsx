import { Checkbox } from '@mui/material'
import { useTradePanelStore } from '../store'
import { Trans } from '@lingui/react/macro'
import { FormControlLabel } from '@/components/UI/FormControlLabel'
import { TPSLInput } from './TPSLInput'
import { useMemo } from 'react'
import { TpSlTypeEnum } from '../../type'
import { useTradePageStore } from '../../store/TradePageStore'

export const TPSL = () => {
  const {
    tpslOpen,
    setTpslOpen,
    tpType,
    setTpType,
    tpValue,
    setTpValue,
    slType,
    setSlType,
    slValue,
    setSlValue,
  } = useTradePanelStore()
  const { symbolInfo } = useTradePageStore()
  const [tpPlaceHolder, slPlaceHolder] = useMemo(() => {
    let tpPlaceHolder = `TP(${symbolInfo?.quoteSymbol})`
    let slPlaceHolder = `SL(${symbolInfo?.quoteSymbol})`

    const renderPlaceHolder = (type: TpSlTypeEnum, isSL?: boolean) => {
      switch (type) {
        case TpSlTypeEnum.ROI:
          return 'ROI(%)'
        case TpSlTypeEnum.Change:
          return 'Change(%)'
        case TpSlTypeEnum.Pnl:
          return `Pnl(${symbolInfo?.quoteSymbol})`
        case TpSlTypeEnum.PRICE:
        default:
          return isSL ? slPlaceHolder : tpPlaceHolder
      }
    }

    tpPlaceHolder = renderPlaceHolder(tpType)
    slPlaceHolder = renderPlaceHolder(slType, true)
    return [tpPlaceHolder, slPlaceHolder]
  }, [tpType, slType, symbolInfo?.quoteSymbol])
  return (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={tpslOpen}
            onChange={() => setTpslOpen(!tpslOpen)}
            sx={{
              p: 0,
              mr: 0,
              color: '#848E9C',
              borderRadius: '2px',
              '&.Mui-checked': {
                color: '#fff',
              },
              '& .MuiSvgIcon-root': {
                fontSize: 16,
              },
            }}
          />
        }
        label={
          <div className="text-[12px] font-medium text-[#fff]">
            <Trans>TP/SL</Trans>
          </div>
        }
      />

      {/* tpsl */}
      {tpslOpen && (
        <div className="mt-[10px] flex gap-[8px]">
          <TPSLInput
            quoteToken={symbolInfo?.quoteSymbol ?? ''}
            type={tpType}
            value={tpValue}
            onChange={setTpValue}
            onTypeChange={setTpType}
            placeHolder={tpPlaceHolder}
          />
          <TPSLInput
            quoteToken={symbolInfo?.quoteSymbol ?? ''}
            type={slType}
            value={slValue}
            onChange={setSlValue}
            onTypeChange={setSlType}
            placeHolder={slPlaceHolder}
          />
        </div>
      )}
    </>
  )
}
