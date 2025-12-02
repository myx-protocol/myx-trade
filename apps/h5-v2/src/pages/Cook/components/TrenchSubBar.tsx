import { Box } from '@mui/material'
interface IntervalBarProps {
  className?: string
  children?: React.ReactNode
}

export const TrenchSubBar = ({ className, children }: IntervalBarProps) => {
  return (
    <Box className={`mt-[12px] flex items-center justify-between px-[16px] ${className}`}>
      {children}
    </Box>
  )
}
