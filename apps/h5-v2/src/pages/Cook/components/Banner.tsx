import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import { useNavigate } from 'react-router-dom'
import CookBannerIcon from '@/assets/cook/cook-banner-icon.svg'
import { ArrowRight } from '@/components/Icon'

export const Banner = () => {
  const navigate = useNavigate()
  return (
    <Box className="cursor-pointer px-[16px]" onClick={() => navigate('/market')}>
      <Box
        className={'flex items-center gap-[40px] rounded-[8px] bg-[rgba(0,227,165,0.05)] p-[16px]'}
      >
        <Box className={'flex flex-1 flex-col gap-[8px]'}>
          <Box className={'flex flex-col gap-[4px]'}>
            <h3 className={'text-[12px] leading-[1.1] font-[700] text-white'}>
              <Trans>Launch Any Pair, Claim 2% Genesis Rewards!</Trans>
            </h3>
            <p className={'text-secondary text-[10px] leading-[1.3]'}>
              <Trans>
                Zero setup required. Be the first to provide liquidity and capture exclusive fee
                shares.
              </Trans>
            </p>
          </Box>
          <Box className={'flex items-center'}>
            <span className={'text-green text-[12px] font-[500]'}>
              <Trans>Create Now</Trans>
            </span>
            <ArrowRight size={12} color="#00E3A5" />
          </Box>
        </Box>
        <Box className={'w-[54px] shrink-0'}>
          <img src={CookBannerIcon} alt="" className={'h-[56px] w-[54px]'} />
        </Box>
      </Box>
    </Box>
  )
}
