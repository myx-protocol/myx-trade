import type { AVAILABLE_LOCALES } from '@/locales/locale'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import React from 'react'

interface LangOption {
  label: string
  value: string
}

interface LangSwitchProps<T = AVAILABLE_LOCALES> {
  value: string
  onChange: (value: T) => void
  options?: LangOption[]
  sx?: any
  className?: string
}

const DEFAULT_OPTIONS: LangOption[] = [
  { label: 'CN', value: 'CN' },
  { label: 'EN', value: 'EN' },
]

const LangSwitchGroupStyle = {
  borderRadius: '4px',
  p: '0px',
  // width: '53px',
  height: '19px',
  minWidth: '53px',
  minHeight: '19px',
}

const LangSwitchStyle = {
  flex: 1,
  fontSize: 10,
  fontWeight: 500,
  background: '#202129',
  color: '#848E9C',
  transition: 'all 0.2s',
  border: 'none',
  minWidth: 0,
  minHeight: 0,
  // borderTopLeftRadius: idx === 0 ? '4px' : 0,
  // borderBottomLeftRadius: idx === 0 ? '4px' : 0,
  // borderTopRightRadius: idx === options.length - 1 ? '4px' : 0,
  // borderBottomRightRadius: idx === options.length - 1 ? '4px' : 0,
  '&.Mui-selected': {
    borderRadius: '4px !important',
    background: 'var(--brand-green)',
    color: '#101114',
  },
  '&.Mui-selected:hover': {
    background: 'var(--brand-green)',
  },
}

const LangSwitch = <T = AVAILABLE_LOCALES,>({
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  className,
}: LangSwitchProps<T>) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, v) => v && onChange(v)}
      sx={LangSwitchGroupStyle}
      className={className}
    >
      {options.map((opt, idx) => (
        <ToggleButton key={opt.value} value={opt.value} sx={LangSwitchStyle} disableRipple>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default LangSwitch
