import { Box } from '@mui/material'
import { Trans } from '@lingui/react/macro'
import IconRockets from '@/assets/images/cook/rockets.png'

export const QuickActivateEntry = ({ onClick }: { onClick?: () => void }) => {
  return (
    <Box
      role="button"
      className="relative flex h-[16px] cursor-pointer items-center rounded-[20px] bg-[#00E3A5] pr-[4px] pl-[23px]"
      onClick={onClick}
    >
      <span
        className="text-[12px] leading-none text-[#101114]"
        style={{ fontFamily: 'DingTalk_JinBuTi, sans-serif', letterSpacing: '-1.2px' }}
      >
        <Trans>激活</Trans>
      </span>
      <Box className="absolute top-[-1px] left-[-1px] h-[20px] w-[20px] rounded-[24px]">
        <img src={IconRockets} alt="" className="pointer-events-none absolute h-full w-full" />
        <img
          src={IconRockets}
          alt=""
          className="pointer-events-none absolute h-full w-full mix-blend-hard-light"
        />
      </Box>
    </Box>
  )
}
