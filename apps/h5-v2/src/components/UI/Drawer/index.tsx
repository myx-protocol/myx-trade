import { Drawer as MuiDrawer } from '@mui/material'
import type { SxProps, Theme } from '@mui/material'
import type { ReactNode } from 'react'
import IconClose from '@/assets/svg/close.svg?react'
import { merge } from 'lodash-es'

interface CustomDrawerProps {
  children: ReactNode
  open: boolean
  onClose: () => void
  anchor?: 'left' | 'right' | 'top' | 'bottom'
  variant?: 'permanent' | 'persistent' | 'temporary'
  title?: string | ReactNode
  sx?: SxProps<Theme>
  className?: string
  showCloseButton?: boolean
}

export const Drawer = ({
  children,
  open,
  onClose,
  anchor = 'right',
  variant = 'temporary',
  title,
  sx,
  className = '',
  showCloseButton = true,
}: CustomDrawerProps) => {
  return (
    <MuiDrawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      variant={variant}
      slotProps={{
        paper: {
          sx: merge(
            {
              backgroundColor: '#18191F',
              border: '1px solid #31333D',
              padding: '20px',
              width: anchor === 'left' || anchor === 'right' ? 'auto' : '100%',
              height: anchor === 'top' || anchor === 'bottom' ? 'auto' : '100%',
            },
            sx,
          ),
        },
      }}
      className={className}
    >
      <div className="flex items-center justify-between">
        {title}
        {showCloseButton && (
          <div
            className="absolute top-[20px] right-[20px] flex cursor-pointer items-center justify-center"
            onClick={onClose}
          >
            <IconClose onClick={onClose} className="h-[16px] w-[16px]" />
          </div>
        )}
      </div>

      {children}
    </MuiDrawer>
  )
}
