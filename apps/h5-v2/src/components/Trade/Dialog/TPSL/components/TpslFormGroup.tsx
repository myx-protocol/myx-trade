import { useState } from 'react'
import { TpslTypeSelect } from './TpslTypeSelect'
import { TpSlTypeEnum } from '@/components/Trade/type'
import { NumberInputPrimitive } from '@/components/UI/NumberInput/NumberInputPrimitive'
import { Trans } from '@lingui/react/macro'
import { Slider } from '@mui/material'
import clsx from 'clsx'

interface TpslFormGroupProps {
  quoteSymbol: string
  onChange: (value: number) => void
}

const AmountSliderMarks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

export const TpslFormGroup = () => {
  const [tpslType, setTpslType] = useState<TpSlTypeEnum>(TpSlTypeEnum.PRICE)
  const [sliderValue, setSliderValue] = useState<number>(0)
  return (
    <div className="mt-[20px]">
      <TpslTypeSelect value={tpslType} onChange={setTpslType} quoteToken="USDT" />
      {/* price & type value */}
      <div className="mt-[4px] flex items-center justify-between gap-[8px]">
        {/* trigger price */}
        <div className="flex min-h-[46px] w-[202px] items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
          <NumberInputPrimitive className="flex-1 text-left" placeholder="触发价格" />
          <p className="text flex-shrink-0">USDT</p>
        </div>
        {/* type value */}
        <div className="flex min-h-[46px] w-[140px] flex-[1_1_0%] items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
          <NumberInputPrimitive className="flex-1 text-left" placeholder="Change" />
          <p className="text flex-shrink-0">USDT</p>
        </div>
      </div>
      {/* amount input */}
      <div className="mt-[8px] flex min-h-[46px] w-full items-center rounded-[8px] bg-[#202129] p-[12px] text-[14px] leading-[1] font-medium text-white">
        <NumberInputPrimitive className="flex-1 text-left" placeholder="Amount" />
        <p className="text flex-shrink-0">USDT</p>
      </div>
      {/* amout slider */}
      <div className="mt-[8px]">
        <div className="px-[8px]">
          <Slider
            value={sliderValue}
            onChange={(_, newValue) => {
              setSliderValue(newValue as number)
            }}
            min={0}
            max={100}
            step={1}
            valueLabelDisplay="auto"
            //   slots={{
            //     valueLabel: ValueLabelComponent,
            //   }}
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              height: '12px',
              borderRadius: '9px',
              padding: 0,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
                background: '#fff',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
              '& .MuiSlider-rail': {
                opacity: 1,
                background: '#272830',
                borderRadius: 9,
                boxSizing: 'border-box',
              },
              '& .MuiSlider-track': {
                background: 'linear-gradient(90deg, #4cb86a 0%, #3ba07b 100%)',
                borderRadius: 9,
              },
              '@media (pointer: coarse)': {
                padding: '0px!important',
              },
            }}
          />
        </div>
        <div className="mt-[6px] flex justify-between">
          {AmountSliderMarks.map((m) => (
            <p
              key={m.value}
              className={clsx(
                'text-center text-[10px] font-medium',
                sliderValue >= m.value ? 'text-white' : 'text-[#4D515C]',
              )}
            >
              {m.label}
            </p>
          ))}
        </div>
      </div>
      {/* tips */}
      <p className="mt-[8px] text-[12px] leading-[1.5] font-medium text-[#848E9C]">
        <Trans>
          当最新价格 <span className="text-white">≥125,306.6 SUSDT</span> 时，将以 -- 平仓, 数量
          0.051 SBTC,预期收益 414.2249 SUSDT(69.31%),预期收益
          <span className="text-rise">123 USDT</span>
        </Trans>
      </p>
    </div>
  )
}
