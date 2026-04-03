import { Box } from '@mui/material'
import { FilterLine, Pause } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'
import { forwardRef } from 'react'

export const Card = forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    count?: number
    className?: string
    onFilter?: () => void
    onMouseOver?: () => void
    onMouseLeave?: () => void
  }
>(({ children, className = '', count = 0, onMouseOver, onMouseLeave }, ref) => {
  return (
    <Box
      ref={ref}
      className={`flex flex-col rounded-[6px] ${className}`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Box>
  )
})

Card.displayName = 'Card'

export const CardTitle = ({
  children,
  className,
  onFilter = () => {},
  count = 0,
  onMouseOver,
  onMouseLeave,
  refreshState,
}: {
  refreshState?: false | number
  children: React.ReactNode
  className?: string
  onFilter?: () => void
  count?: number
  onMouseOver?: () => void
  onMouseLeave?: () => void
}) => {
  return (
    <Box
      className={`flex h-[48px] w-full items-center justify-between px-[24px] pt-[16px] pb-[12px] ${className}`}
      onMouseOver={onMouseOver}
      onMouseLeave={onMouseLeave}
    >
      <Box className={'flex-1 gap-[4px] text-[18px] leading-[1] font-[700] text-white'}>
        {children}
      </Box>
      {refreshState === false && (
        <Box className={'mr-[12px]'}>
          <Pause size={12} />
        </Box>
      )}
      <Box
        className={'flex cursor-pointer items-center gap-[4px] leading-[1] text-white'}
        onClick={() => onFilter()}
      >
        <FilterLine size={12} />
        <span>
          <Trans>Filter</Trans>
        </span>
        {count > 0 && (
          <Box
            className={
              'bg-deep-gradient flex h-[14px] w-[14px] items-center justify-center rounded-full text-[10px] leading-[1] font-[500]'
            }
          >
            {count}
          </Box>
        )}
      </Box>
    </Box>
  )
}
