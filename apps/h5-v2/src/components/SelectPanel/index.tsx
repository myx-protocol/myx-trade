import { Box, Popover, styled } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import React, { useMemo, useState } from 'react'
import { ArrowDown } from '@/components/Icon'

interface SelectPanelProps {
  className?: string
  label?: string
  maxCount?: number
  value?: string | number
  options: {
    icon?: string
    label?: React.ReactNode
    value?: string | number
  }[]
  onChange?: (value?: string | number) => void
}

const StyledPopover = styled(Popover)(() => ({
  '& .MuiPaper-root': {
    borderRadius: 8,
    padding: '4px 8px',
    backgroundColor: 'var(--deep-bg)',
    border: '1px solid var(--bg-plus)',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.12)',
    minWidth: '200px',
    zIndex: 3000,
    transformOrigin: 'top right',
    transition: 'opacity 0.15s ease, transform 0.15s ease',
    '&[data-entered="true"]': {
      opacity: 1,
      transform: 'scale(1)',
    },
    '&[data-entered="false"]': {
      opacity: 0,
      transform: 'scale(0.97)',
    },
  },
}))

export const SelectPanel = ({ maxCount = 3, value, options = [], onChange }: SelectPanelProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const displayed = useMemo(() => {
    return [...options].slice(0, maxCount)
  }, [maxCount, options])

  const handlePopoverClose = () => {
    setAnchorEl(null)
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const open = Boolean(anchorEl)
  return (
    <Box className={'overflow-visible'}>
      <Box
        className={
          'border-dark-border text-secondary flex h-[40px] items-center gap-[4px] rounded-[6px] border-1 px-[12px] py-[4px]'
        }
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Box
          className={`cursor-pointer rounded-[6px] p-[6px] ${value === undefined || value === '' || value === null ? 'bg-base-bg text-white' : ''}`}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
            e.stopPropagation()
            e.preventDefault()
            onChange?.(undefined)
            handlePopoverClose()
          }}
        >
          <Trans>All</Trans>
        </Box>

        {displayed.map((o) => {
          return (
            <Box
              key={o.value}
              className={`cursor-pointer rounded-[6px] p-[6px] ${value === o?.value ? 'bg-base-bg text-white' : ''}`}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                e.stopPropagation()
                e.preventDefault()
                onChange?.(o.value)
                handlePopoverClose()
              }}
            >
              {o?.icon ? (
                <Box className={'aspect-square h-[20px] w-[20px] min-w-[20px] rounded-full'}>
                  <img src={o.icon} className={'h-[20px] w-[20px]'} />
                </Box>
              ) : (
                <>{o?.label}</>
              )}
            </Box>
          )
        })}

        <Box className={'h-[14px] w-[14px] text-white'}>
          <ArrowDown size={14} />
        </Box>
      </Box>
      <StyledPopover
        id="mouse-over-popover"
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        container={document.body}
        disablePortal={false} // ✅ 确保在 body 下渲染
      >
        <ul className={'flex flex-col leading-[1] font-[500] text-white'}>
          {options.map((o, i) => {
            return (
              <li
                key={i}
                className={
                  'hover:bg-base-bg flex min-h-[48px] cursor-pointer items-center gap-[12px] rounded-[6px] px-[9px] py-[12px]'
                }
                onClick={() => {
                  onChange?.(o.value)
                  handlePopoverClose()
                }}
              >
                {o.icon ? (
                  <Box className={'aspect-square h-[24px] w-[24px] min-w-[24px] rounded-full'}>
                    <img src={o.icon} className={'h-full w-full'} />
                  </Box>
                ) : (
                  <></>
                )}
                <span>{o.label}</span>
              </li>
            )
          })}
        </ul>
      </StyledPopover>
    </Box>
  )
}
