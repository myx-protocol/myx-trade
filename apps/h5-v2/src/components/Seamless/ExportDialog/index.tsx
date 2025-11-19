import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import useGlobalStore from '@/store/globalStore'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '@/components/UI/Button'
export const ExportDialog = () => {
  const { exportSeamlessKeyDialogOpen, setExportSeamlessKeyDialogOpen } = useGlobalStore()

  const seamlessKey = '0x1234567890abcdef1234567890abcdef1f'
  return (
    <DialogBase
      title={t`Export Seamless Trading Key`}
      open={exportSeamlessKeyDialogOpen}
      onClose={() => setExportSeamlessKeyDialogOpen(false)}
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
        <div className="mt-[32px]">
          <p className="text-[14px] leading-[14px] font-medium text-[#848E9C]">
            <Trans>Seamless Trading Key</Trans>
          </p>
          <div className="mt-[8px] mt-[10px] flex w-full items-center rounded-[6px] border-[1px] border-[#3A404A] p-[8px]">
            <p className="text-[14px] leading-[14px] font-medium text-[#CED1D9]">{seamlessKey}</p>
          </div>
        </div>

        <div className="mt-[24px]">
          <PrimaryButton
            className="w-full"
            style={{
              borderRadius: '8px',
              height: '44px',
              fontWeight: 500,
            }}
            onClick={() => {
              navigator.clipboard.writeText(seamlessKey)
            }}
          >
            <Trans>Copy</Trans>
          </PrimaryButton>
        </div>
        <div className="mt-[12px] flex gap-[8px]">
          <div className="mt-[6px] h-[6px] w-[6px] rounded-[50%] bg-[#848E9C]" />
          <div className="flex-1 text-[12px] leading-[140%] font-[400] text-[#848E9C]">
            <Trans>
              Private Key Security: Keep your private key safe. If shared, it may be misused for
              trading permissions. If compromised, revoke access immediately. This key cannot
              transfer assets.
            </Trans>
          </div>
        </div>
        <div className="mt-[6px] flex gap-[8px]">
          <div className="mt-[6px] h-[6px] w-[6px] rounded-[50%] bg-[#848E9C]" />
          <div className="flex-1 text-[12px] leading-[140%] font-[400] text-[#848E9C]">
            <Trans>
              How to Use: To enable Seamless Trading, go to Settings → Import Key. You can then
              trade in any browser without a wallet.
            </Trans>
          </div>
        </div>
      </div>
    </DialogBase>
  )
}
