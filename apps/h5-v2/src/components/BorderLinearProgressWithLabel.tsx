import styled from '@emotion/styled'
import { Box, LinearProgress, linearProgressClasses, type LinearProgressProps } from '@mui/material'
import { formatNumberPercent } from '@/utils/formatNumber.ts'

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 8,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'var(--light-bg)',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 8,
    opacity: 0.35,
    backgroundColor: 'var(--brand-green)',
  },
}))

export function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box className={'flex items-center'}>
      <Box className={'min-w-[60px] flex-1'}>
        <BorderLinearProgress variant="determinate" {...props} />
      </Box>
      <Box className={'min-w-[38px] text-right text-[12px] font-[500] text-white'}>
        {`${formatNumberPercent(props.value / 100, 0, false)}`}
      </Box>
    </Box>
  )
}
