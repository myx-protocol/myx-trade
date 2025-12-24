import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { InputBase } from '@mui/material'
import deleteIcon from '@/assets/icon/commons/delete.svg'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useState } from 'react'
import { PrimaryButton } from '@/components/UI/Button'
import CompleteIcon from '@/components/UI/Icon/CompleteIcon'
import InfoIcon from '@/components/UI/Icon/InfoIcon'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { toast } from 'react-hot-toast'
import { useSeamlessStore } from '@/store/seamless/createStore'
import type { SeamlessAccount } from '@/store/seamless/initialState'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'
import { TradeMode } from '@/pages/Trade/types'
import { useChangeSdkTradeMode } from '@/hooks/seamless/use-change-sdk-trade-mode'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'

export const SetPasswordDialog = () => {
  const { seamlessPasswordDialogOpen, setSeamlessPasswordDialogOpen, setTradeMode } =
    useGlobalStore()
  const [show, setShow] = useState(false)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { seamlessAccountList, setSeamlessAccountList, setActiveSeamlessAddress } =
    useSeamlessStore()
  const { symbolInfo } = useTradePageStore()
  const { changeSdkTradeMode } = useChangeSdkTradeMode(symbolInfo?.chainId)
  const { client } = useMyxSdkClient(symbolInfo?.chainId)

  return (
    <DialogBase
      title={t`Set Your Password`}
      open={seamlessPasswordDialogOpen}
      onClose={() => {
        setSeamlessPasswordDialogOpen(false)
        changeSdkTradeMode(false)
      }}
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
          <p className="text-[14px] leading-[14px] font-medium text-[#CED1D9]">
            <Trans>Your Password</Trans>
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
        </div>
        <div className="mt-[24px]">
          <PrimaryButton
            className="w-full"
            style={{
              borderRadius: '6px',
              height: '44px',
              fontWeight: 500,
            }}
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true)
                const rs = await client?.seamless.createSeamless({
                  password,
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

                    console.log('seamlessAccountList-->', seamlessAccountList)
                    console.log('idx-->', idx)

                    if (idx !== -1) {
                      seamlessAccountList[idx] = { ...seamlessAccount }
                    } else {
                      seamlessAccountList.push(seamlessAccount)
                    }
                  }

                  console.log('seamlessAccount.authorized-->', seamlessAccount)
                  if (!seamlessAccount.authorized[symbolInfo?.chainId as number]?.authorized) {
                    const authRes = await client?.seamless.authorizeSeamlessAccount({
                      approve: true,
                      seamlessAddress: seamlessAccount.seamlessAddress,
                      chainId: symbolInfo?.chainId as number,
                    })

                    if (!authRes) {
                      const idx = seamlessAccountList.findIndex(
                        (item) => item.seamlessAddress === seamlessAccount.seamlessAddress,
                      )
                      const newSeamlessAccount = {
                        ...seamlessAccountList[idx],
                        authorized: {
                          [symbolInfo?.chainId as number]: {
                            authorized: true,
                          },
                        },
                      }
                      seamlessAccountList[idx] = newSeamlessAccount
                      setSeamlessAccountList([...seamlessAccountList])
                    }
                  }

                  setActiveSeamlessAddress(seamlessAccount.masterAddress)
                  setTradeMode(TradeMode.Seamless)
                  setSeamlessPasswordDialogOpen(false)
                } else {
                  toast.error('Create seamless failed')
                }
              } catch (error) {
                console.error('error-->', error)
              } finally {
                setLoading(false)
              }
            }}
          >
            <Trans>Enable Seamless Trading</Trans>
          </PrimaryButton>
        </div>
        <div className="mt-[12px] flex cursor-pointer items-center justify-center gap-1 text-center text-[12px] leading-[100%] font-[400] text-[#CED1D9]">
          <InfoIcon size={12} color="#CED1D9" />
          <Trans>What infomation am i signing?</Trans>
        </div>
      </div>
    </DialogBase>
  )
}
