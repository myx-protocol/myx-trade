import { styled } from '@mui/material/styles'
import Menu, { type MenuProps } from '@mui/material/Menu'

export const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    border: '1px solid var(--dark-border)',
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: 'var(--basic-white)',
    backgroundColor: `var(--bg-plus)`,
    '& .MuiMenu-list': {
      padding: '4px 8px',
    },
    '& .MuiMenuItem-root': {
      fontSize: 14,
      fontWeight: 500,
      padding: '12px 9px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderRadius: 6,

      '&:hover': {
        backgroundColor: 'var(--base-bg)',
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}))
