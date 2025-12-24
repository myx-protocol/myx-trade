import { Box, DialogContent } from '@mui/material'
import { DialogTheme, DialogTitleTheme } from '../DialogBase'
import useGlobalStore from '@/store/globalStore'
import { Trans } from '@lingui/react/macro'
import { isNil } from 'lodash-es'
import RedeemCodeDialogTitleImg from '@/assets/images/vip/redeem-code-dialog-title.webp'
import { PrimaryButton } from '../UI/Button'
import { useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'

export const VipRedeemResultDialog = () => {
  const { vipRedeemResultDialogOpen, vipRedeemResultData, setVipRedeemResultDialogOpen } =
    useGlobalStore()
  const { level, startTime, endTime, oldLevel } = vipRedeemResultData || {}
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const closeResultDialog = () => {
    setVipRedeemResultDialogOpen(false)
  }

  return (
    <DialogTheme
      open={vipRedeemResultDialogOpen}
      onClose={() => setVipRedeemResultDialogOpen(false)}
      sx={{
        '.MuiPaper-root': {
          maxWidth: '390px',
          overflow: 'visible',
        },
      }}
    >
      <DialogTitleTheme>
        <Box className="absolute top-[-71px] left-1/2 h-[151px] w-[158px] -translate-x-1/2">
          <img src={RedeemCodeDialogTitleImg} alt={'MYX VIP'} width={'100%'} height={'100%'} />
        </Box>
      </DialogTitleTheme>
      <DialogContent>
        <Box className="relative flex flex-col items-center justify-center text-center text-[14px] font-medium">
          <Box className="mt-3 mb-6 text-[20px] leading-none font-bold">
            <Trans>Activation Successful</Trans>
          </Box>
          <Box>
            <p className="leading-[1.5]">
              {!isNil(oldLevel) && !isNil(level) && oldLevel <= level && (
                <Trans>
                  During the validity period, you can enjoy a{' '}
                  <span className="text-[#FFD700]">VIP{level}</span> experience
                </Trans>
              )}
              {!isNil(oldLevel) && !isNil(level) && oldLevel > level && (
                <>
                  <Trans>
                    Obtain <span className="text-[#FFD700]">VIP{level}</span> Experience:
                  </Trans>
                  <br />
                  <Trans>
                    During the validity period, if your level is below <span>VIP{level}</span>, you
                    can enjoy the benefits of <span>VIP{level}</span>.
                  </Trans>
                </>
              )}
            </p>
          </Box>
          <Box className="mt-2 text-[#FFD700]">
            <p className="text-[12px] leading-none text-[#FFD700]">
              <Trans>
                Valid From: {dayjs.unix(startTime!).format('YYYY/MM/DD HH:mm')} —{' '}
                {dayjs.unix(endTime!).format('YYYY/MM/DD HH:mm')}
              </Trans>
            </p>
          </Box>
        </Box>
        <Box className="mt-8 flex gap-3">
          <PrimaryButton
            simple
            style={{
              width: '100%',
              height: '44px',
              fontSize: '14px',
              fontWeight: '500',
              background: '#4d515c',
              color: '#FFFFFF',
            }}
            onClick={closeResultDialog}
          >
            <Trans>Got it</Trans>
          </PrimaryButton>
          <PrimaryButton
            style={{
              width: '100%',
              height: '44px',
              fontSize: '14px',
              fontWeight: '500',
            }}
            onClick={() => {
              if (!pathname.startsWith('/trade')) {
                navigate('/trade')
              }
              closeResultDialog()
            }}
          >
            <Trans>Trade Now</Trans>
          </PrimaryButton>
        </Box>

        <Box className="text-secondary mt-3 flex items-center justify-center gap-2 text-[12px] leading-[18px] font-normal">
          <Trans>The experience will become effective within 10 minutes</Trans>
        </Box>
      </DialogContent>
    </DialogTheme>
  )
}
