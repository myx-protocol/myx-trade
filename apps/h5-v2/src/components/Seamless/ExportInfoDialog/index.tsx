import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '@/components/UI/Button'
import InfoIcon from '@/components/UI/Icon/InfoIcon'

export const ExportInfoDialog = () => {
  const { exportSeamlessInfoDialogOpen, setExportSeamlessInfoDialogOpen } = useGlobalStore()
  return (
    <DialogBase
      open={exportSeamlessInfoDialogOpen}
      onClose={() => setExportSeamlessInfoDialogOpen(false)}
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
      <div className="mt-[24px] p-[16px]">
        <div className="flex items-center justify-center">
          <InfoIcon size={56} color="#848E9C" />
        </div>
        <div className="mt-[20px] text-center text-[14px] leading-[14px] leading-[140%] font-[400] text-[#CED1D9]">
          <Trans>
            By importing this key on another device, you can access MYX from any browser without
            needing a wallet extension or using a wallet app browser. This key is for trading
            authorization only and will never hold any of your assets. For your security, do not
            share it with anyone.
          </Trans>
        </div>
        <div className="mt-[24px] flex items-center justify-center gap-[12px]">
          <PrimaryButton
            className="flex-1"
            style={{
              borderRadius: '8px',
              height: '44px',
              fontWeight: 500,
            }}
            onClick={() => {
              setExportSeamlessInfoDialogOpen(false)
            }}
          >
            <Trans>Authorizing</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
