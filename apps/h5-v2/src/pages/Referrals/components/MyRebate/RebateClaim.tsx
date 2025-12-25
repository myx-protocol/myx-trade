import { Trans } from '@lingui/react/macro'
import { PrimaryButton as Button } from '@/components/UI/Button'
import { useReferralStore } from '@/store/referrals'
import { useState } from 'react'
import { DialogContent } from '@mui/material'
import { useClaimReferralRebate } from '@/pages/Referrals/hooks/useClaimRebate'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import Big from 'big.js'
import { formatNumberPrecision } from '@/utils/formatNumber'
import { getChainInfo } from '@/config/chainInfo'
import { toast } from '@/components/UI/Toast'
import { DialogTheme, DialogTitleTheme } from '@/components/DialogBase'

const COMMON_TRANSLATE_USDC_ASSETS_SCALE = 2

export function RebateClaim() {
  const { bonusInfo } = useReferralStore()
  const { countdown } = useClaimReferralRebate()
  const [open, setOpen] = useState(false)

  if (!bonusInfo?.availableAmount || !Big(bonusInfo.availableAmount).gt(0)) {
    return null
  }

  return (
    <>
      <Button
        className="w-[160px] lg:w-[108px]"
        disabled={countdown !== 0}
        onClick={() => setOpen(true)}
      >
        {countdown === 0 ? <Trans>Claim</Trans> : <>{Math.round(countdown / 1000)}s</>}
      </Button>
      <RebateClaimDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function RebateClaimDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [confirming, setConfirming] = useState(false)
  const { bonusChainInfo } = useReferralStore()
  const { claimChainId, setClaimChainId, onClaimReferralRebate } = useClaimReferralRebate()
  const { chainId: activeChainId, switchChain } = useWalletConnection()

  const handleSelectChain = (chainId: number) => {
    if (chainId !== activeChainId) {
      switchChain?.({ chainId })
      return
    }
    setClaimChainId(chainId)
  }

  const handleClaim = async () => {
    try {
      setConfirming(true)
      await onClaimReferralRebate()
      onClose()
    } catch (e: any) {
      toast.error({ title: e.message || 'Error' })
    } finally {
      setConfirming(false)
    }
  }

  return (
    <DialogTheme
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ style: { background: '#202129', color: 'white' } }}
    >
      <DialogTitleTheme className="border-b border-[#31333D]">
        <Trans>Select Claim Amount</Trans>
      </DialogTitleTheme>
      <DialogContent>
        <div className="mt-4 flex min-h-[120px] flex-col gap-3">
          {bonusChainInfo?.map((item) => (
            <div
              key={item.chainId}
              className={`relative flex cursor-pointer items-center justify-between overflow-hidden rounded-lg border p-4 ${claimChainId === item.chainId ? 'border-[#00E3A5] bg-[#202129]' : 'border-transparent bg-[#18191F]'}`}
              onClick={() => handleSelectChain(item.chainId)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{getChainInfo(item.chainId)?.label}</span>
              </div>
              <div className="text-sm font-medium">
                {formatNumberPrecision(item.availableAmount, COMMON_TRANSLATE_USDC_ASSETS_SCALE)}{' '}
                {item.token}
              </div>
              {claimChainId === item.chainId && (
                <div className="absolute right-0 bottom-0 text-[#00E3A5]">
                  <svg
                    width="39"
                    height="36"
                    viewBox="0 0 39 36"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M7 36L23 20L39 4V36H7Z" fill="currentColor" />
                    <path
                      d="M27.8888 30L24 26.0433L24.9967 25.2407L27.2501 27.0061C28.1733 25.9114 30.2157 23.7296 33.0344 22L33.2699 22.552C30.6792 24.9355 28.5558 28.2854 27.8888 30Z"
                      fill="black"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button
            style={{
              height: '44px',
            }}
            className="w-full"
            loading={confirming}
            disabled={!claimChainId}
            onClick={handleClaim}
          >
            <Trans>Confirm</Trans>
          </Button>
        </div>
      </DialogContent>
    </DialogTheme>
  )
}
