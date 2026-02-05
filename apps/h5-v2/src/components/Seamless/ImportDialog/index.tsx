import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { InputBase } from '@mui/material'
import { useCallback, useState } from 'react'
import { PrimaryButton } from '@/components/UI/Button'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { toast } from '@/components/UI/Toast'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import CompleteIcon from '@/components/UI/Icon/CompleteIcon'
import deleteIcon from '@/assets/icon/commons/delete.svg'

export const ImportDialog = () => {
  const { importSeamlessKeyDialogOpen, setImportSeamlessKeyDialogOpen, symbolInfo } =
    useGlobalStore()
  const [seamlessKey, setSeamlessKey] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)
  const { seamlessAccountList, setSeamlessAccountList, setActiveSeamlessAddress } =
    useSeamlessStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)

  const handleImportSeamlessKey = useCallback(async () => {
    try {
      setLoading(true)
      const rs = await client?.seamless.importSeamlessPrivateKey({
        privateKey: seamlessKey,
        password: password,
        chainId: symbolInfo?.chainId as number,
      })

      if (rs?.code === 0) {
        const seamlessAccount: SeamlessAccount = {
          masterAddress: rs.data?.masterAddress || '',
          seamlessAddress: rs.data?.seamlessAccount || '',
          apiKey: rs.data?.apiKey || '',
          authorized: {
            [symbolInfo?.chainId as number]: {
              authorized: rs?.data?.authorized || false,
            },
          },
        }

        if (seamlessAccountList.length === 0) {
          setSeamlessAccountList([seamlessAccount])
        } else {
          const idx = seamlessAccountList.findIndex(
            (item) => item.seamlessAddress === seamlessAccount.seamlessAddress,
          )

          if (idx !== -1) {
            seamlessAccountList[idx] = { ...seamlessAccount }
          } else {
            seamlessAccountList.push(seamlessAccount)
          }
        }

        setSeamlessAccountList([...seamlessAccountList])

        toast.success({
          title: t`Import seamless key success`,
        })
        setImportSeamlessKeyDialogOpen(false)
      } else {
        toast.error({
          title: client?.utils.formatErrorMessage(rs),
        })
      }
    } catch (error) {
      toast.error({
        title: t`${client?.utils.formatErrorMessage(error)}`,
      })
    } finally {
      setLoading(false)
    }
  }, [
    seamlessKey,
    password,
    client,
    setImportSeamlessKeyDialogOpen,
    symbolInfo?.chainId,
    seamlessAccountList,
    setSeamlessAccountList,
    setActiveSeamlessAddress,
  ])

  return (
    <DialogBase
      title={t`Import Seamless Key`}
      open={importSeamlessKeyDialogOpen}
      onClose={() => setImportSeamlessKeyDialogOpen(false)}
      sx={{
        '& .MuiDialog-paper': {
          paddingLeft: 0,
          paddingRight: 0,
        },
      }}
    >
      <div className="mt-[14px] py-[16px]">
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
        <p className="mt-[12px] text-[14px] leading-[14px] font-medium text-[#848E9C]">
          <Trans>Password</Trans>
        </p>
        <div className="mt-[8px] mt-[10px] flex w-full items-center rounded-[6px] border-[1px] border-[#3A404A] p-[8px]">
          <InputBase
            placeholder={t`Enter your password`}
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {password.length > 0 && (
              <img
                src={deleteIcon}
                className="h-[20px] w-[20px] cursor-pointer"
                onClick={() => setPassword('')}
              />
            )}
            {show ? (
              <Visibility
                sx={{ color: '#848E9C', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => setShow(!show)}
              />
            ) : (
              <VisibilityOff
                sx={{ color: '#848E9C', fontSize: '20px', cursor: 'pointer' }}
                onClick={() => setShow(!show)}
              />
            )}
          </div>
        </div>
        <p className="mt-[12px] flex items-center gap-1">
          {password.length >= 8 && password.length <= 128 ? (
            <CompleteIcon size={12} color="#00E3A5" />
          ) : (
            <CompleteIcon size={12} color="#848E9C" />
          )}
          <span className="text-[12px] leading-[100%] font-[400] text-[#848E9C]">
            <Trans>8 to 128 characters</Trans>
          </span>
        </p>
        <p className="mt-[12px] flex items-center gap-1">
          {/\d/.test(password) ? (
            <CompleteIcon size={12} color="#00E3A5" />
          ) : (
            <CompleteIcon size={12} color="#848E9C" />
          )}
          <span className="text-[12px] leading-[100%] font-[400] text-[#848E9C]">
            <Trans>At least 1 number</Trans>
          </span>
        </p>
        <p className="mt-[12px] flex items-center gap-1">
          {/[A-Z]/.test(password) ? (
            <CompleteIcon size={12} color="#00E3A5" />
          ) : (
            <CompleteIcon size={12} color="#848E9C" />
          )}
          <span className="text-[12px] leading-[100%] font-[400] text-[#848E9C]">
            <Trans>At least 1 upper case letter</Trans>
          </span>
        </p>
        {/* </div> */}

        <div className="mt-[24px]">
          <PrimaryButton
            loading={loading}
            className="w-full"
            style={{
              borderRadius: '6px',
              height: '44px',
              fontWeight: 500,
            }}
            onClick={async () => await handleImportSeamlessKey()}
          >
            <Trans>Verify</Trans>
          </PrimaryButton>
        </div>
      </div>
    </DialogBase>
  )
}
