import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import TrenchBannerIcon from '@/assets/earn/trench-banner-icon.svg'

export const TrenchBanner = () => {
  return (
    <Box className="px-[16px]">
      <Box
        className={
          'flex items-center gap-[12px] rounded-[8px] border-1 border-[#292B33] px-[16px] py-[20px]'
        }
      >
        <Box className={'flex flex-1 flex-col gap-[6px]'}>
          <h3 className={'text-[16px] leading-[1.1] font-[700] text-white'}>
            <Trans>Maximize Your Base Assets</Trans>
          </h3>
          <p className={'text-[11px] leading-[1.3] text-[rgba(255,255,255,0.6)]'}>
            <Trans>
              Fuel the MPM 2.0 engine. Turn your holdings into a high-yield generating powerhouse
            </Trans>
          </p>
        </Box>
        <Box className={'w-[60px] shrink-0'}>
          <img src={TrenchBannerIcon} alt="" className={'h-[52px] w-[60px]'} />
        </Box>
      </Box>
    </Box>
  )
}
