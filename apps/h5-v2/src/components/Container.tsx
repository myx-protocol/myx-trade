import { Box } from '@mui/material'

const Container = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <Box className={`text-secondary mx-auto w-[1196px] min-w-[1196px] ${className}`}>
      {children}
    </Box>
  )
}

export default Container
