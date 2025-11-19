import { Checkbox as MuiCheckbox } from '@mui/material'

export const CheckBox = ({
  checked,
  onChange,
  size = 16,
}: {
  checked: boolean
  onChange: () => void
  size?: number
}) => {
  return (
    <MuiCheckbox
      sx={{
        padding: 0,
        color: '#848E9C',
        '&.Mui-checked': {
          color: '#00E3A5',
        },
        '& .MuiSvgIcon-root': {
          fontSize: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
        },
      }}
      checked={checked}
      onChange={onChange}
    />
  )
}
