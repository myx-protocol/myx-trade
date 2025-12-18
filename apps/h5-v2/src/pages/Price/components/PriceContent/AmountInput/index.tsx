import { useState } from 'react'
import clsx from 'clsx'
import { Slider, Tooltip } from '@mui/material'

const ValueLabelComponent = (props: any) => {
  const { children, value } = props
  return (
    <Tooltip
      enterTouchDelay={0}
      placement="top"
      title={
        <span
          style={{
            background: '#fff',
            color: '#101114',
            fontWeight: 500,
            fontSize: '12px',
            borderRadius: '4px',
            padding: '4px 8px',
            boxShadow: '0 2px 8px 0 #18191c',
            minWidth: '40px',
            minHeight: '20px',
            display: 'inline-block',
            textAlign: 'center',
          }}
        >
          {value}%
        </span>
      }
      slotProps={{
        tooltip: {
          sx: {
            background: 'transparent',
            boxShadow: 'none',
            p: 0,
            mt: -2,
          },
        },
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -8],
              },
            },
          ],
        },
      }}
    >
      {children}
    </Tooltip>
  )
}

const AmountSliderMarks = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

export const AmountInput = ({ onchange }: { onchange: (value: number) => void }) => {
  const [sliderValue, setSliderValue] = useState(0)

  return (
    <div className="mt-[12px] px-[16px]">
      <Slider
        value={sliderValue}
        onChange={(_, newValue) => {
          setSliderValue(newValue as number)
          onchange(newValue as number)
        }}
        min={0}
        max={100}
        step={1}
        valueLabelDisplay="auto"
        slots={{
          valueLabel: ValueLabelComponent,
        }}
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
  )
}
