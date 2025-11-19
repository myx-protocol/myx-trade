import { Box } from '@mui/material'
import { FilterLine } from '@/components/Icon'
import { Trans } from '@lingui/react/macro'

export const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
  onFilter?: () => void
}) => {
  return <Box className={`flex flex-col rounded-[6px] bg-[#14151A] ${className}`}>{children}</Box>
}

export const CardTitle = ({
  children,
  className,
  onFilter = () => {},
}: {
  children: React.ReactNode
  className?: string
  onFilter?: () => void
}) => {
  return (
    <Box
      className={`flex h-[48px] w-full items-center justify-between px-[24px] pt-[16px] pb-[12px] ${className}`}
    >
      <Box className={'flex-1 gap-[4px] text-[18px] leading-[1] font-[700] text-white'}>
        {children}
      </Box>
      <Box
        className={'flex cursor-pointer items-center gap-[4px] leading-[1] text-white'}
        onClick={() => onFilter()}
      >
        <FilterLine size={12} />
        <span>
          <Trans>Filter</Trans>
        </span>
        <Box
          className={
            'bg-green flex h-[14px] w-[14px] items-center justify-center rounded-full text-[10px] leading-[1] font-[500]'
          }
        >
          2
        </Box>
      </Box>
    </Box>
  )
}
