import { Button, CircularProgress } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'

interface PrimaryButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  loading?: boolean
  disabled?: boolean
  simple?: boolean
}

const PrimaryButton = ({
  children,
  onClick,
  className,
  style,
  loading,
  disabled,
  simple = false,
}: PrimaryButtonProps) => {
  const defaultSx: SxProps<Theme> = {
    background: simple ? '#008C66' : 'linear-gradient(135deg, #3D996B 0%, #00996F 100%)',
    border: '1px solid transparent',
    backgroundImage: simple
      ? 'none'
      : 'linear-gradient(135deg, #3D996B 0%, #00996F 100%), linear-gradient(135deg, #80FF9580 0%, #00E5A780 100%)',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
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
    position: 'relative',

    '&:hover': {
      backgroundImage: simple
        ? 'none'
        : 'linear-gradient(135deg, #359960 0%, #00856B 100%), linear-gradient(135deg, #80FF9580 0%, #00E5A780 100%)', // 悬停时稍微变暗
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

export default PrimaryButton
