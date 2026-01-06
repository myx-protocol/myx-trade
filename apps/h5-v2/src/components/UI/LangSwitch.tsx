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
  height: '19px',
  minHeight: '19px',
  width: 'auto',
  display: 'inline-flex',
}

const LangSwitchStyle = {
  fontSize: 10,
  fontWeight: 500,
  background: '#202129',
  color: '#848E9C',
  transition: 'all 0.2s',
  border: 'none',
  minWidth: 'auto',
  minHeight: 0,
  px: '8px',
  whiteSpace: 'nowrap',
  '&.Mui-selected': {
    borderRadius: '4px !important',
    background: '#00996F',
    color: '#fff',
  },
  '&.Mui-selected:hover': {
    background: '#00996F',
    color: '#fff',
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
      {options.map((opt) => (
        <ToggleButton key={opt.value} value={opt.value} sx={LangSwitchStyle} disableRipple>
          {opt.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

export default LangSwitch
