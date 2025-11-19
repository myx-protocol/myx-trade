import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { InputBase } from '@mui/material'
import { useState } from 'react'
import { PrimaryButton } from '@/components/UI/Button'

export const ImportDialog = () => {
  const { importSeamlessKeyDialogOpen, setImportSeamlessKeyDialogOpen } = useGlobalStore()
  const [seamlessKey, setSeamlessKey] = useState('')
  return (
    <DialogBase
      title={t`Import Seamless Key`}
      open={importSeamlessKeyDialogOpen}
      onClose={() => setImportSeamlessKeyDialogOpen(false)}
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
        <p className="text-[14px] leading-[14px] font-medium text-[#848E9C]">
          <Trans>Seamless Key</Trans>
        </p>
        <div className="mt-[8px] mt-[10px] flex w-full items-center rounded-[6px] border-[1px] border-[#3A404A] p-[8px]">
          <InputBase
            placeholder={t`Please Enter`}
            type={'text'}
            value={seamlessKey}
            onChange={(e) => setSeamlessKey(e.target.value)}
            sx={{
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                leading: '14px',
              },
            }}
            className="w-full flex-1 text-[14px] leading-[14px] font-medium text-[white]"
          />
          <div className="flex items-center justify-end gap-[4px]">
            <span className="cursor-pointer text-[12px] leading-[100%] font-[400] text-[#00E3A5]">
              <Trans>Paste</Trans>
            </span>
          </div>
        </div>
        <p className="mt-[12px] text-[12px] leading-[100%] font-[400] text-[#848E9C]">
          <Trans>Only Seamless Trading private key import supported.</Trans>
        </p>
        <div className="mt-[24px]">
          <PrimaryButton
            className="w-full"
            style={{
              borderRadius: '6px',
              height: '44px',
              fontWeight: 500,
            }}
            onClick={() => {
              setImportSeamlessKeyDialogOpen(false)
            }}
          >
            <Trans>Verify</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
