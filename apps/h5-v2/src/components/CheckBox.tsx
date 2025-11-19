import { Checkbox, FormControlLabel } from '@mui/material'

import { memo } from 'react'
import { CheckBoxIcon, CheckBoxOutline } from '@/components/Icon'

type CustomCheckBoxProps = {
  checked: boolean
  disabled?: boolean
  label?: string | React.ReactNode
  onChange?: (val: boolean) => void
  type?: 'normal' | 'em'
  size?: number
  labelClassName?: string
  className?: string
}

// export const StyledCheckBox = styled(Checkbox)`
//     color: var(--secondary-text);
//     padding: 0;
//     margin-right: 0.5
// '&.Mui-checked': {
//     color: type === 'normal' ? 'var(--basic-white)' : 'var(--brand-green)',
// },
// `

const style = {
  marginLeft: 0,
  marginRight: 0,
  '& .MuiTypography-root': {
    fontSize: '12px',
    lineHeight: 1,
  },
}
export const CustomCheckBox = memo(
  ({
    checked,
    onChange,
    disabled,
    label,
    type = 'em',
    size = 12,
    labelClassName = '',
  }: CustomCheckBoxProps) => {
    return (
      <FormControlLabel
        className={'text-regular flex items-center text-[12px] leading-[1]'}
        sx={style}
        control={
          <Checkbox
            name={'checkbox'}
            checked={checked}
            disabled={disabled}
            onChange={(e) => {
              onChange?.(e.target.checked)
            }}
            icon={<CheckBoxOutline size={size} />}
            checkedIcon={<CheckBoxIcon size={size} />}
            sx={{
              color: 'var(--secondary-text)',
              p: 0,
              mr: 0.5,
              '&.Mui-checked': {
                color: type === 'normal' ? 'var(--basic-white)' : 'var(--brand-green)',
              },
            }}
          />
        }
        label={<span className={labelClassName}>{label}</span>}
      />
    )
  },
)
