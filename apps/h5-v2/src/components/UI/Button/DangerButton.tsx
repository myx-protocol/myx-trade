import { Button, CircularProgress } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

interface DangerButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  loading?: boolean
  disabled?: boolean
}

const DangerButton = ({
  children,
  onClick,
  className,
  style,
  loading,
  disabled,
}: DangerButtonProps) => {
  const defaultSx: SxProps<Theme> = {
    background: 'linear-gradient(135deg, #C23749 0%, #BA4C47 100%)',
    border: '1px solid transparent',
    backgroundImage:
      'linear-gradient(135deg, #C23749 0%, #BA4C47 81.25%), linear-gradient(135deg, #F6627680 0%, #EC645E80 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    color: 'white',
    borderRadius: '7px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '28px',
    fontWeight: '400',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    position: 'relative',

    '&:hover': {
      backgroundImage:
        'linear-gradient(135deg, #A52A3E 0%, #9E3D3D 100%), linear-gradient(135deg, #F6627680 0%, #EC645E80 100%)', // 悬停时稍微变暗
    },
    ...style,
  }

  return (
    <Button
      className={className || ''}
      onClick={onClick}
      sx={defaultSx}
      disabled={disabled || loading}
    >
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>{children}</span>
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            color: 'white',
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-10px',
            marginLeft: '-10px',
          }}
        />
      )}
    </Button>
  )
}

export default DangerButton
