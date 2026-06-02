import { Button } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import loadingIcon from '@/assets/icon/loading.svg'
interface DangerButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
  loading?: boolean
  disabled?: boolean
  id?: string
  dataAnalytics?: string
}

const DangerButton = ({
  children,
  onClick,
  className,
  style,
  loading,
  disabled,
  id,
  dataAnalytics,
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
    '&:disabled': {
      color: 'white',
    },
    opacity: loading ? 0.6 : 1,
    ...style,
  }

  return (
    <Button
      className={className || ''}
      onClick={onClick}
      sx={defaultSx}
      disabled={disabled || loading}
      id={id ?? undefined}
      data-analytics={dataAnalytics ?? undefined}
    >
      <div className="flex items-center justify-center gap-[10px]">
        {loading && <img src={loadingIcon} className="animate-spin" />}
        <div>{children}</div>
      </div>
    </Button>
  )
}

export default DangerButton
