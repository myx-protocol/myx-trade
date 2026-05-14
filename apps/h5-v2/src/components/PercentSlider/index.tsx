import { Slider, Tooltip } from '@mui/material'
import clsx from 'clsx'
import type { SxProps, Theme } from '@mui/material'

const DEFAULT_MARKS = [
  { value: 0, label: '0%' },
  { value: 20, label: '20%' },
  { value: 40, label: '40%' },
  { value: 60, label: '60%' },
  { value: 80, label: '80%' },
  { value: 100, label: '100%' },
]

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

const defaultSliderSx: SxProps<Theme> = {
  width: '100%',
  boxSizing: 'border-box',
  height: '12px',
  borderRadius: '9px',
  padding: 0,
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    background: '#fff',
    boxShadow: '0px 0px 4px 0px rgba(255, 255, 255, 0.25)',
    '&:hover': { boxShadow: 'none' },
    '&.Mui-active': { boxShadow: 'none', width: 12, height: 12 },
    '&.Mui-focusVisible': { boxShadow: 'none', width: 12, height: 12 },
  },
  '& .MuiSlider-rail': {
    opacity: 1,
    background: '#2D3138',
    borderRadius: 9,
    boxSizing: 'border-box',
  },
  '& .MuiSlider-track': {
    background: 'linear-gradient(90deg, #4D9959 0%, #33806B 100%)',
    border: 'none',
    borderRadius: 9,
  },
  '@media (pointer: coarse)': {
    padding: '0px!important',
  },
}

export interface PercentSliderProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  marks?: Array<{ value: number; label: string }>
  sliderSx?: SxProps<Theme>
  className?: string
}

export const PercentSlider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  marks = DEFAULT_MARKS,
  sliderSx,
  className,
}: PercentSliderProps) => {
  return (
    <div className={className}>
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={min}
        max={max}
        step={step}
        valueLabelDisplay="auto"
        slots={{ valueLabel: ValueLabelComponent }}
        sx={sliderSx ?? defaultSliderSx}
      />
      <div className="mx-[-6px] mt-[6px] flex justify-between">
        {marks.map((m) => (
          <p
            key={m.value}
            className={clsx(
              'text-center text-[10px] font-medium',
              value >= m.value ? 'text-white' : 'text-[#4D515C]',
            )}
          >
            {m.label}
          </p>
        ))}
      </div>
    </div>
  )
}
