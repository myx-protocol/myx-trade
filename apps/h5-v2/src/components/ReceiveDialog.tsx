import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { Trans } from '@lingui/react/macro'

import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { QRCodeSVG } from 'qrcode.react'
import { CopyIcon } from '@/components/Icon'

import { useMemo } from 'react'
import { getChainInfo } from '@/config/chainInfo'
import type { ChainId } from '@/config/chain'
import { PrimaryButton } from '@/components/UI/Button'
import { toast } from '@/components/UI/Toast'

interface ReceiveDialogProps {
  address: string
  chainId: number
  open: boolean
  onClose: () => void
  symbol: string
}

export const ReceiveDialog = ({ address, chainId, open, onClose, symbol }: ReceiveDialogProps) => {
  const chainInfo = useMemo(() => {
    if (!chainId) return null
    return getChainInfo(chainId as ChainId)
  }, [chainId])

  return (
    <DialogBase
      title={t`Receive` + ' ' + symbol}
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
          width: '390px',
        },
        '& .MuiDialogTitle-root': {
          paddingLeft: '20px',
          marginRight: '20px',
        },
      }}
    >
      <div className="p-[16px]">
        <div className="flex justify-center pt-[32px]">
          <div className="rounded-[8px] border-[1px] border-[#31333D] p-[12px]">
            <QRCodeSVG value={address || ''} size={80} bgColor="#23242B" fgColor="#fff" />
          </div>
        </div>
        <div className="mt-[16px] flex flex-col gap-[4px]">
          <p className="text-[12px] font-[500] text-[#848E9C]">
            <Trans>Address</Trans>
          </p>
          <div className="flex h-[48px] items-center justify-between rounded-[4px] border-[1px] border-[#31333D] p-[8px]">
            <p className="text-[12px] font-medium text-[white]">{address}</p>
            <CopyIcon
              size={12}
              className="cursor-pointer text-[white]"
              onClick={() => {
                navigator.clipboard.writeText(address || '')
                toast.success({
                  title: t`Copied to clipboard`,
                })
              }}
            />
          </div>
        </div>
        <div className="mt-[16px] flex h-[48px] flex-col gap-[4px]">
          <p className="text-[12px] font-[500] text-[#848E9C]">
            <Trans>Chains</Trans>
          </p>
          <div className="flex items-center justify-between rounded-[4px] border-[1px] border-[#31333D] p-[8px]">
            <p className="text-[12px] font-medium text-[white]">{chainInfo?.label}</p>
          </div>
        </div>
        <div className="mt-[20px]">
          <PrimaryButton
            className="w-full rounded-[44px]"
            style={{
              height: '44px',
              fontSize: '14px',
              borderRadius: '44px',
              fontWeight: '500',
            }}
            onClick={async () => {
              navigator.clipboard
                .writeText(address || '')
                .then(() => {
                  toast.success({
                    title: t`Copied to clipboard`,
                  })
                })
                .catch((error) => {
                  console.error('error-->', error)
                  toast.error({
                    title: t`Failed to copy`,
                  })
                })
            }}
          >
            <Trans>Copy Address</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
