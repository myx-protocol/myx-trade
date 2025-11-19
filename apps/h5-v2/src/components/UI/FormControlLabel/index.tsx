import { styled } from '@mui/material'
import { FormControlLabel as MuiFormControlLabel } from '@mui/material'

export const FormControlLabel = styled(MuiFormControlLabel)(() => ({
  marginLeft: 0,
  marginRight: 0,
  '& .MuiTypography-root': {
    fontSize: '12px',
    lineHeight: '1',
    color: '#FFFFFF',
    marginLeft: '4px',
    userSelect: 'none',
  },
}))
