import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '@/components/UI/Button'
import InfoIcon from '@/components/UI/Icon/InfoIcon'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useState } from 'react'
import { InputBase } from '@mui/material'
import { t } from '@lingui/core/macro'

export const ExportInfoDialog = () => {
  const {
    exportSeamlessInfoDialogOpen,
    setExportSeamlessInfoDialogOpen,
    setExportSeamlessKeyDialogOpen,
  } = useGlobalStore()
  const { activeSeamlessAddress, seamlessAccountList } = useSeamlessStore()
  const [loading, setLoading] = useState(false)
  const { symbolInfo } = useGlobalStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const [password, setPassword] = useState('')

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
        <InputBase
          placeholder={t`Enter your password`}
          type={'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              leading: '14px',
              marginTop: '16px',
              border: '1px solid #3A404A',
              padding: '8px',
              borderRadius: '6px',
            },
          }}
          className="w-full flex-1 text-[14px] leading-[14px] font-medium text-[white]"
        />
        <div className="mt-[24px] flex items-center justify-center gap-[12px]">
          <PrimaryButton
            className="flex-1"
            style={{
              borderRadius: '8px',
              height: '44px',
              fontWeight: 500,
            }}
            loading={loading}
            onClick={async () => {
              try {
                console.log('password-->', password)
                setLoading(true)
                const activeSeamlessAccount = seamlessAccountList.find(
                  (item) => item.masterAddress === activeSeamlessAddress,
                )
                console.log('activeSeamlessAccount-->', activeSeamlessAccount)

                if (!activeSeamlessAccount) {
                  return
                }
                console.log('activeSeamlessAccount-->', activeSeamlessAccount)

                const rs = await client?.seamless.exportSeamlessPrivateKey({
                  password,
                  apiKey: activeSeamlessAccount.apiKey,
                })

                if (rs?.code === 0) {
                  setExportSeamlessKeyDialogOpen(rs.data?.privateKey as string)
                  setExportSeamlessInfoDialogOpen(false)
                }
              } catch (error) {
                console.error('error-->', error)
              } finally {
                setLoading(false)
              }
            }}
          >
            <Trans>Authorizing</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
