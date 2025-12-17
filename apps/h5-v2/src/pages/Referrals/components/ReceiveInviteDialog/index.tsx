import { Dialog, DialogContent } from '@mui/material'
import { useReferralStore } from '@/store/referrals'
import { useAccessParams } from '@/hooks/useAccessParams'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { Trans } from '@lingui/macro'
import { useState, useEffect } from 'react'
import icon from '@/assets/images/referrals/dialog/receiveDialogicon.png'
import accepBg from '@/assets/images/referrals/dialog/acceptBg.png'
import * as api from '@/api/referrals'
import { encryptionAddress } from '@/utils'
import { PrimaryButton } from '@/components/UI/Button'

export const ReceiveInviteDialog = ({
  code,
  close,
}: {
  code: string
  close: (ratio: number) => void
}) => {
  const {
    isReceiveInviteDialogOpen,
    setReceiveInviteDialogOpen,
    bindRelationshipByCode,
    accessToken,
    account,
  } = useReferralStore()
  const accessParams = useAccessParams()
  const { isConnected } = useWalletConnection()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (code && isReceiveInviteDialogOpen && accessToken && account) {
      api.getReferralByCode(code, { accessToken, account }).then((res: any) => {
        setData(res.data)
      })
    }
  }, [code, isReceiveInviteDialogOpen, accessToken, account])

  const handleBind = async () => {
    setLoading(true)
    try {
      if (accessToken) {
        await bindRelationshipByCode(code)
        setReceiveInviteDialogOpen(false)
        close(data?.refereeRatio || 0)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={isReceiveInviteDialogOpen}
      onClose={() => setReceiveInviteDialogOpen(false)}
      PaperProps={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
          maxWidth: '420px',
          width: '100%',
          overflow: 'visible',
        },
      }}
    >
      <DialogContent className="w-full overflow-visible bg-transparent p-0">
        <div className="relative w-full max-w-[420px] border border-transparent sm:max-w-[358px]">
          <div className="absolute top-0 left-[49%] z-10 mx-0 h-[200px] w-[313px] -translate-x-1/2 rounded-t-2xl bg-[#FFEBCC] sm:top-[5px] sm:left-[calc(50%-42px)] sm:mx-10 sm:h-[150px] sm:w-[calc(100%-80px)]">
            <img src={icon} className="mx-auto w-[120px] sm:w-[100px]" alt="icon" />
            {!accessToken || !isConnected ? (
              <p className="z-20 mx-auto w-[80%] bg-gradient-to-r from-[#7A492F] via-[#36251A] to-[#C97D3B] bg-clip-text text-center text-2xl leading-7 font-bold text-transparent sm:text-[24px] sm:leading-6">
                <Trans>Earn up to 20% rebates</Trans>
              </p>
            ) : (
              <>
                {data?.refereeRatio === 0 ? (
                  <p className="mt-5 bg-gradient-to-r from-[#7A492F] via-[#36251A] to-[#C97D3B] bg-clip-text px-[30px] text-center text-2xl leading-[25px] font-bold text-transparent sm:mt-0 sm:text-[20px]">
                    <Trans>Accept now and receive rebates</Trans>
                  </p>
                ) : (
                  <>
                    <p className="-mt-10 bg-gradient-to-r from-[#7A492F] via-[#36251A] to-[#C97D3B] bg-clip-text text-center text-[56px] leading-[60px] font-bold text-transparent sm:text-[40px] sm:leading-[40px]">
                      {data?.refereeRatio ?? 0}%
                    </p>
                    <p className="text-center text-[#9C6C4A]">
                      <Trans>Accept now and receive rebates</Trans>
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          <div className="absolute top-[199.5px] left-[49.5%] z-10 h-[37px] w-[313px] -translate-x-1/2 bg-[#FFEBCC] [clip-path:polygon(0%_0%,100%_0%,50%_100%)] sm:top-[154px] sm:h-[33px] sm:w-[calc(100%-80px)]" />

          <img src={accepBg} className="mt-[70px] sm:mt-[45px]" alt="bg" />

          <div className="absolute bottom-10 z-10 w-full overflow-hidden sm:bottom-[26px]">
            {!accessToken || !isConnected ? (
              <p className="text-center text-lg text-[#F5CF8A] sm:text-sm">
                <Trans>Accept Invitation</Trans>
              </p>
            ) : (
              <>
                <p className="text-center text-lg text-[#F5CF8A] sm:text-sm">
                  {data?.referrer ? encryptionAddress(data?.referrer) : '--'}
                </p>
                <p className="text-center text-lg text-[#F5CF8A] sm:text-sm">
                  <Trans>Invites you to join MYX</Trans>
                </p>
              </>
            )}

            <div className="mt-[10px] flex w-full justify-center sm:mt-[6px]">
              <PrimaryButton
                loading={loading}
                onClick={handleBind}
                className="h-[44px] min-h-[44px] w-[260px] rounded-[40px] bg-gradient-to-r from-[#DBB393] to-[#F7DFC4] text-[#1A1B23] sm:h-[40px] sm:min-h-[40px]"
              >
                <Trans>Accept</Trans>
              </PrimaryButton>
            </div>

            <p
              className="mt-3 cursor-pointer text-center text-xs text-[#F5CF8A] sm:mt-[10px]"
              onClick={() => setReceiveInviteDialogOpen(false)}
            >
              <Trans>Later</Trans>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
