import { DialogBase } from '@/components/UI/DialogBase'
import { t } from '@lingui/core/macro'
import useGlobalStore from '@/store/globalStore'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '@/components/UI/Button'
import { InputBase } from '@mui/material'
import { toast } from '@/components/UI/Toast'
export const ExportDialog = () => {
  const { exportSeamlessKeyDialogOpen, setExportSeamlessKeyDialogOpen } = useGlobalStore()

  return (
    <DialogBase
      title={t`Export Seamless Trading Key`}
      open={!!exportSeamlessKeyDialogOpen}
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
          <InputBase
            value={exportSeamlessKeyDialogOpen as string}
            // disabled
            sx={{
              width: '100%',
              color: 'white',
              '& .MuiInputBase-input': {
                color: 'white !important',
                fontSize: '14px',
                fontWeight: '500',
                leading: '14px',
                marginTop: '16px',
                border: '1px solid #3A404A',
                padding: '8px',
                borderRadius: '6px',
              },
            }}
          />
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
              navigator.clipboard
                .writeText(exportSeamlessKeyDialogOpen as string)
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
