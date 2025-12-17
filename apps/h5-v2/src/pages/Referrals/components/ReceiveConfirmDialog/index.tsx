import { Dialog, DialogContent } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { Trans } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import light from '@/assets/images/referrals/dialog/confirmLight.png'
import ok from '@/assets/images/referrals/dialog/ok.png'
import ConfirmBg from '@/assets/images/referrals/desktop/confirmbg.png'
import { PrimaryButton } from '@/components/UI/Button'

export const ReceiveConfirmDialog = ({ refereeRatio }: { refereeRatio: number }) => {
  const { isReceiveConfirmDialogOpen, setReceiveConfirmDialogOpen } = useReferralStore()
  const navigate = useNavigate()

  return (
    <Dialog
      open={isReceiveConfirmDialogOpen}
      onClose={() => setReceiveConfirmDialogOpen(false)}
      PaperProps={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
          maxWidth: '390px',
          width: '100%',
          overflow: 'visible',
        },
      }}
    >
      <DialogContent className="w-full overflow-visible bg-transparent p-0">
        <div className="relative w-full border border-transparent">
          <img src={light} className="h-[80px] w-full" alt="light" />
          <div className="relative rounded-2xl bg-[#24252E] p-5">
            <img
              src={ConfirmBg}
              className="absolute -top-10 left-1/2 z-0 h-auto w-[90%] -translate-x-1/2"
              alt="bg"
            />
            <img src={ok} className="relative z-10 mx-auto -mt-10" alt="ok" />
            <p className="mt-[25px] text-center text-2xl font-medium text-[#FFEBCC]">
              <Trans>Congratulations!</Trans>
            </p>

            <div className="relative mt-[26px] bg-[rgba(217,217,217,0.1)] p-[14px_26px] text-center text-[#FFD0AB]">
              <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-[#24252E]" />
              <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-[#24252E]" />
              {refereeRatio !== 0 ? (
                <span>
                  <Trans>You've earned {refereeRatio ?? 0}% trading fee refund</Trans>
                </span>
              ) : (
                <span>
                  <Trans>Invitation binding successful</Trans>
                </span>
              )}
            </div>

            <div className="mt-5 flex w-full justify-center">
              <PrimaryButton
                className="mt-5 h-[44px] min-h-[44px] w-[390px] rounded-[40px] bg-gradient-to-r from-[#DBB393] to-[#F7DFC4] text-[#1A1B23]"
                onClick={() => {
                  navigate('/trade')
                  setReceiveConfirmDialogOpen(false)
                }}
              >
                <Trans>Trade Now</Trans>
              </PrimaryButton>
            </div>

            <p
              className="mt-3 cursor-pointer text-center text-xs text-[#F5CF8A]"
              onClick={() => {
                setReceiveConfirmDialogOpen(false)
              }}
            >
              <Trans>Refer a friend to earn Rebates</Trans>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
