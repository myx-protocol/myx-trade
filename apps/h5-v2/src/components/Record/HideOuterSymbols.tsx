import { useCallback, type ReactNode } from 'react'
import { CheckBox } from '../UI/CheckBox'
import { FormControlLabel } from '../UI/FormControlLabel'

interface HideOuterSymbolsProps {
  checked: boolean
  onChange: (checked: boolean) => void
  right?: ReactNode
}

export const HideOuterSymbols = ({ checked, onChange, right }: HideOuterSymbolsProps) => {
  const onCheckedChange = useCallback(() => {
    onChange(!checked)
  }, [checked, onChange])
  return (
    <div className="flex items-center justify-between px-[16px] pt-[16px] pb-[10px]">
      <div className="flex items-center">
        <FormControlLabel
          control={<CheckBox checked={checked} onChange={onCheckedChange} />}
          label={<span className="text-[12px] text-[#CED1D9]">Hide other symbols</span>}
        />
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  )
}
