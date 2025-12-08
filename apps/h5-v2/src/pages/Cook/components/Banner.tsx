import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { useNavigate } from 'react-router-dom'

export const Banner = () => {
  const navigate = useNavigate()
  return (
    <Box className="banner cursor-pointer p-[16px]" onClick={() => navigate('/market')}>
      <Box className={'border-base flex items-center gap-[24px] rounded-[10px] border-1 p-[16px]'}>
        <Box className={'logo w-m-[60px] w-[60px]'}></Box>
        <Box className={'flex flex-1 flex-col gap-[8px]'}>
          <h3 className={'text-[16px] leading-[1] font-[700] text-white'}>
            <Trans>Create a Market</Trans>
          </h3>
          <p className={'text-secondary text-[12px] leading-[1.2]'}>
            <Trans>Create your own derivatives market to enjoy LP rewards and fee sharing.</Trans>
          </p>
        </Box>
      </Box>
    </Box>
  )
}
