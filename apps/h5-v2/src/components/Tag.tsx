import { Box } from '@mui/material'

type TagType = 'primary' | 'default' | 'disabled' | 'warning'

const CommonTag = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <Box
      className={`inline-flex items-center gap-[4px] rounded-[6px] px-[6px] py-[6px] text-[12px] leading-[1] ${className}`}
    >
      {children}
    </Box>
  )
}
export const Tag = ({
  type = 'default',
  children,
  className = '',
}: {
  type: TagType
  children: React.ReactNode
  className?: string
}) => {
  switch (type) {
    case 'primary':
      return <CommonTag className={`bg-brand-10 text-green ${className}`}>{children}</CommonTag>
    case 'default':
      return <CommonTag className={`bg-base text-white ${className}`}>{children}</CommonTag>
    case 'disabled':
      return <CommonTag className={`bg-base text-secondary ${className}`}>{children}</CommonTag>
    case 'warning':
      return <CommonTag className={`bg-warning-10 text-warning ${className}`}>{children}</CommonTag>
    default:
      return <CommonTag className={`bg-base text-secondary ${className}`}>{children}</CommonTag>
  }
}
