import { Tooltip as MuiTooltip, type TooltipProps } from '@mui/material'
import type { ReactElement } from 'react'

export interface TooltipsProps extends Omit<TooltipProps, 'children'> {
  title: string
  children: ReactElement
  placement?: TooltipProps['placement']
  arrow?: boolean
  maxWidth?: number
  fontSize?: string
  backgroundColor?: string
  textColor?: string
}

export const Tooltips = ({
  title,
  children,
  placement = 'top',
  arrow = true,
  maxWidth = 280,
  fontSize = '12px',
  backgroundColor = '#202129',
  textColor = '#FFFFFF',
  sx,
  ...props
}: TooltipsProps) => {
  return (
    <MuiTooltip
      title={title}
      placement={placement}
      arrow={arrow}
      {...props}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: `${backgroundColor} !important`,
            color: `${textColor} !important`,
            fontSize: fontSize,
            maxWidth: maxWidth,
            padding: '8px 12px',
            borderRadius: '8px',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
            lineHeight: '1.4',
            wordBreak: 'break-word',
          },
        },
        arrow: {
          sx: {
            color: `${backgroundColor} !important`,
          },
        },
      }}
      sx={{
        ...sx,
      }}
    >
      {children}
    </MuiTooltip>
  )
}
