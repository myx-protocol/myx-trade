import React, { useState } from 'react'
import type { ReactNode } from 'react'
import { Popover as MuiPopover, type PopoverProps } from '@mui/material'
import { merge } from 'lodash-es'

interface CustomPopoverProps {
  children: ReactNode
  trigger: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: 'top' | 'bottom' | 'left' | 'right'
  offset?: number
  className?: string
  slotProps?: PopoverProps['slotProps']
}

export const Popover = ({
  children,
  trigger,
  open: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  offset = 8,
  className = '',
  slotProps,
}: CustomPopoverProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
    if (!isControlled) {
      setInternalOpen(true)
    }
    onOpenChange?.(true)
  }

  const handleClose = () => {
    setAnchorEl(null)
    if (!isControlled) {
      setInternalOpen(false)
    }
    onOpenChange?.(false)
  }

  const getAnchorOrigin = () => {
    switch (placement) {
      case 'top':
        return { vertical: 'top' as const, horizontal: 'center' as const }
      case 'bottom':
        return { vertical: 'bottom' as const, horizontal: 'center' as const }
      case 'left':
        return { vertical: 'center' as const, horizontal: 'left' as const }
      case 'right':
        return { vertical: 'center' as const, horizontal: 'right' as const }
      default:
        return { vertical: 'bottom' as const, horizontal: 'center' as const }
    }
  }

  const getTransformOrigin = () => {
    switch (placement) {
      case 'top':
        return { vertical: 'bottom' as const, horizontal: 'center' as const }
      case 'bottom':
        return { vertical: 'top' as const, horizontal: 'center' as const }
      case 'left':
        return { vertical: 'center' as const, horizontal: 'right' as const }
      case 'right':
        return { vertical: 'center' as const, horizontal: 'left' as const }
      default:
        return { vertical: 'top' as const, horizontal: 'center' as const }
    }
  }

  return (
    <>
      <div onClick={handleOpen}>{trigger}</div>
      <MuiPopover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={getAnchorOrigin()}
        transformOrigin={getTransformOrigin()}
        slotProps={merge(
          {
            paper: {
              sx: {
                backgroundColor: '#18191F',
                boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.15)',
                borderRadius: '4px',
                padding: 0,
                marginTop: placement === 'bottom' ? `${offset}px` : undefined,
                marginBottom: placement === 'top' ? `${offset}px` : undefined,
                marginLeft: placement === 'right' ? `${offset}px` : undefined,
                marginRight: placement === 'left' ? `${offset}px` : undefined,
              },
            },
          },
          slotProps,
        )}
        className={className}
      >
        {children}
      </MuiPopover>
    </>
  )
}
