import { Button, CircularProgress } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

interface InfoButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  loading?: boolean
  disabled?: boolean
}

const InfoButton = ({
  children,
  onClick,
  className,
  style,
  loading,
  disabled,
}: InfoButtonProps) => {
  const defaultSx: SxProps<Theme> = {
    background: '#2D3138',
    color: 'white',
    borderRadius: '7px',
    fontSize: '12px',
    minWidth: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '400',
    textTransform: 'none',
    whiteSpace: 'nowrap',
    px: '12px',
    position: 'relative',
    '&:hover': {
      background: '#3A404A', // 悬停时稍微变亮
    },
    '&:disabled': {
      background: '#2D3138',
      color: 'white',
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

export default InfoButton
