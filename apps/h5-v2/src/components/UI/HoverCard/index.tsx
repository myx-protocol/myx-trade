import React, { useState, useRef } from 'react'
import type { ReactNode } from 'react'
import { Popper, Paper } from '@mui/material'

interface HoverCardProps {
  children: ReactNode
  trigger: ReactNode
  openDelay?: number
  closeDelay?: number
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'bottom-start'
    | 'top-start'
    | 'left-start'
    | 'right-start'
    | 'bottom-end'
    | 'top-end'
    | 'left-end'
    | 'right-end'
  offset?: number
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const HoverCard = ({
  children,
  trigger,
  openDelay = 200,
  closeDelay = 300,
  placement = 'bottom',
  offset = 8,
  className = '',
  open: controlledOpen,
  onOpenChange,
}: HoverCardProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const openTimeoutRef = useRef<Timeout | null>(null)
  const closeTimeoutRef = useRef<Timeout | null>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }

    if (!open) {
      setAnchorEl(event.currentTarget)
      openTimeoutRef.current = setTimeout(() => {
        if (isControlled) {
          onOpenChange?.(true)
        } else {
          setInternalOpen(true)
        }
      }, openDelay)
    }
  }

  const handleMouseLeave = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current)
      openTimeoutRef.current = null
    }

    closeTimeoutRef.current = setTimeout(() => {
      if (isControlled) {
        onOpenChange?.(false)
      } else {
        setInternalOpen(false)
      }
    }, closeDelay)
  }

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div>{trigger}</div>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={placement}
        style={{
          zIndex: 1300,
        }}
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, offset],
            },
          },
        ]}
      >
        <Paper
          sx={{
            backgroundColor: '#18191F',
            boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.15)',
            borderRadius: '8px',
            padding: 0,
            pointerEvents: 'auto',
          }}
          className={className}
        >
          {children}
        </Paper>
      </Popper>
    </div>
  )
}
