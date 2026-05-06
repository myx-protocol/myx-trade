import { Button } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import loadingIcon from '@/assets/icon/loading.svg'
import React from 'react'
import type { AnalyticsProps } from '@/vite-env'

interface PrimaryButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  children?: React.ReactNode
  onClick?: () => void
  className?: string
  style?: SxProps<Theme>
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
  id,
  dataAnalytics,
}: PrimaryButtonProps & AnalyticsProps) => {
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
      id={id}
      data-analytics={dataAnalytics}
    >
      <div className="flex items-center justify-center gap-[10px]">
        {loading && <img src={loadingIcon} className="animate-spin" />}
        <div>{children}</div>
      </div>
    </Button>
  )
}

export default PrimaryButton
