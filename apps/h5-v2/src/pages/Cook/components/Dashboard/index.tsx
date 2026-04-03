import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { TVL } from './TVL.tsx'
import { TradeVolume } from '@/pages/Cook/components/Dashboard/TradeVolume.tsx'

export const Dashboard = () => {
  return (
    <Box className="px-[16px] pb-[16px]">
      <Box className={'text-[16px] leading-[1] font-[700]'}>
        <Trans>Dashboard</Trans>
      </Box>
      <Box className="mt-[12px] flex h-[104px] gap-[8px]">
        <TVL />
        <TradeVolume />
      </Box>
    </Box>
  )
}
