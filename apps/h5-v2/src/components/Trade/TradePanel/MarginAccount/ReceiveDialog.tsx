import { InfoButton } from '@/components/UI/Button'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { Trans } from '@lingui/react/macro'
import { useState } from 'react'
import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import { useTradePageStore } from '../../store/TradePageStore'
import { QRCodeSVG } from 'qrcode.react'
import { CopyIcon } from '@/components/Icon'
import toast from 'react-hot-toast'

export const ReceiveDialogButton = () => {
  const [open, setOpen] = useState(false)
  const { address } = useWalletConnection()
  const { symbolInfo } = useTradePageStore()

  return (
    <>
      <InfoButton className="w-full" onClick={() => setOpen(true)}>
        <Trans>Receive</Trans>
      </InfoButton>
      <DialogBase
        title={t`Receive` + ' ' + symbolInfo?.quoteSymbol}
        open={open}
        onClose={() => setOpen(false)}
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
            <div className="flex items-center justify-between rounded-[4px] border-[1px] border-[#31333D] p-[8px]">
              <p className="text-[12px] font-medium text-[white]">{address}</p>
              <CopyIcon
                size={12}
                className="cursor-pointer text-[white]"
                onClick={() => {
                  navigator.clipboard.writeText(address || '')
                  toast.success(t`Copied to clipboard`)
                }}
              />
            </div>
          </div>
          <div className="mt-[16px] flex flex-col gap-[4px]">
            <p className="text-[12px] font-[500] text-[#848E9C]">
              <Trans>Chains</Trans>
            </p>
            <div className="flex items-center justify-between rounded-[4px] border-[1px] border-[#31333D] p-[8px]">
              <p className="text-[12px] font-medium text-[white]">Arbitrum One</p>
            </div>
          </div>
        </div>
      </DialogBase>
    </>
  )
}
