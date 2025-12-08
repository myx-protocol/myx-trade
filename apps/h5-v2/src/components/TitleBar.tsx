import type { ReactNode } from 'react'
import { Box } from '@mui/material'
import { BackIcon } from '@/components/Icon'
import { useNavigate } from 'react-router-dom'

export const TitleBar = ({
  className = '',
  title,
  onBack,
}: {
  className?: string
  title?: ReactNode
  onBack?: () => void
}) => {
  const navigate = useNavigate()
  return (
    <Box
      className={`box-sizing text-basic-white bg-deep bottom z-10 flex h-[56px] w-full items-center justify-center text-[16px] font-[500] ${className}`}
    >
      {title}
      <Box
        className={'text-basic-white absolute top-[16px] left-[16px]'}
        onClick={() => {
          if (onBack) {
            onBack()
          } else {
            navigate(-1)
          }
        }}
      >
        <BackIcon size={24} />
      </Box>
      s
    </Box>
  )
}
