import { Slider, Tooltip } from '@mui/material'
import clsx from 'clsx'
import type { SxProps, Theme } from '@mui/material'
import Big from 'big.js'

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
  /** The actual value (not percentage). Will be displayed as percentage internally. */
  value: number | string
  /** Called with the actual value (not percentage) when the slider changes. */
  onChange: (value: number) => void
  /** Minimum of the actual value range. Defaults to 0. */
  min?: number | string
  /** Maximum of the actual value range. Defaults to 100. */
  max?: number | string
  step?: number
  marks?: Array<{ value: number; label: string }>
  sliderSx?: SxProps<Theme>
  className?: string
}

/**
 * Converts an actual value within [min, max] to a percentage (0–100).
 * Formula: (value - min) * 100 / (max - min)
 */
const toPercent = (value: number | string, min: number | string, max: number | string): number => {
  const bigMin = new Big(min)
  const bigMax = new Big(max)
  const range = bigMax.minus(bigMin)
  if (range.eq(0)) return 0
  return new Big(value).minus(bigMin).mul(100).div(range).toNumber()
}

/**
 * Converts a percentage (0–100) back to an actual value within [min, max].
 * Formula: percent * (max - min) / 100 + min
 */
const fromPercent = (percent: number, min: number | string, max: number | string): number => {
  const bigMin = new Big(min)
  const bigMax = new Big(max)
  const range = bigMax.minus(bigMin)
  return new Big(percent).mul(range).div(100).plus(bigMin).toNumber()
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
  // Convert actual value to percentage for display
  const percent = toPercent(value, min, max)
  // Clamp to [0, 100]
  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)))

  return (
    <div className={className}>
      <Slider
        value={clampedPercent}
        onChange={(_, newPercent) => {
          const actualValue = fromPercent(newPercent as number, min, max)
          onChange(actualValue)
        }}
        min={0}
        max={100}
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
              clampedPercent >= m.value ? 'text-white' : 'text-[#4D515C]',
            )}
          >
            {m.label}
          </p>
        ))}
      </div>
    </div>
  )
}
