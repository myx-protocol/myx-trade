import { DialogBase } from '@/components/UI/DialogBase'
import useGlobalStore from '@/store/globalStore'
import { encryptionAddress } from '@/utils'
import { t } from '@lingui/core/macro'
import walletIcon from '@/assets/icon/commons/wallet.svg'
import Reverse from '@/components/Icon/set/ReverseV2'
import { Trans } from '@lingui/react/macro'
import { InputBase } from '@mui/material'
import deleteIcon from '@/assets/icon/commons/delete.svg'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useEffect, useState } from 'react'
import { PrimaryButton } from '@/components/UI/Button'
import WalletIcon from '@/components/UI/Icon/WalletIcon'
import { useWalletStore } from '@/store/wallet/createStore'
import { TradeMode } from '@/pages/Trade/types'
import { useMyxSdkClient } from '@/providers/MyxSdkProvider'
import { useSeamlessStore } from '@/store/seamless/createStore'
import { useChangeSdkTradeMode } from '@/hooks/seamless/use-change-sdk-trade-mode'
import { useTradePageStore } from '@/components/Trade/store/TradePageStore'

export const UnlockAccountDialog = () => {
  const {
    unlockAccountDialogOpen,
    setUnlockAccountDialogOpen,
    setSelectedSeamlessAccountDialogOpen,
    setTradeMode,
    setSeamlessPasswordDialogOpen,
  } = useGlobalStore()
  const { symbolInfo } = useTradePageStore()
  const { client } = useMyxSdkClient(symbolInfo?.chainId)
  const [show, setShow] = useState(false)
  const { setLoginModalOpen } = useWalletStore()
  const [password, setPassword] = useState('')
  const { seamlessAccountList, activeSeamlessAddress, setActiveSeamlessAddress } =
    useSeamlessStore()
  const { changeSdkTradeMode } = useChangeSdkTradeMode(symbolInfo?.chainId)

  useEffect(() => {
    if (activeSeamlessAddress) {
      return
    }

    setActiveSeamlessAddress(seamlessAccountList[0]?.masterAddress || '')
  }, [activeSeamlessAddress])

  return (
    <DialogBase
      title={t`Enter your Password`}
      open={unlockAccountDialogOpen}
      onClose={() => {
        setUnlockAccountDialogOpen(false)
        setTradeMode(TradeMode.Classic)
        setActiveSeamlessAddress('')
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
        <div className="flex items-center gap-[4px]">
          <img src={walletIcon} className="h-[14px] w-[14px]" />
          <p className="text-[white]">{encryptionAddress(activeSeamlessAddress)}</p>
          <div
            className="cursor-pointer"
            onClick={() => {
              setSelectedSeamlessAccountDialogOpen(true)
              setUnlockAccountDialogOpen(false)
            }}
          >
            <Reverse size={14} color="#00E3A5" />
          </div>
        </div>
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
        </div>
        <div className="mt-[24px]">
          <PrimaryButton
            className="w-full"
            style={{
              borderRadius: '6px',
              height: '44px',
              fontWeight: 500,
            }}
            onClick={async () => {
              const activeSeamlessAccount = seamlessAccountList.find(
                (item) => item.masterAddress === activeSeamlessAddress,
              )
              if (!activeSeamlessAccount) {
                return
              }

              const rs = await client?.seamless.unLockSeamlessWallet({
                password,
                masterAddress: activeSeamlessAccount?.masterAddress as string,
                apiKey: activeSeamlessAccount?.apiKey as string,
                chainId: symbolInfo?.chainId as number,
              })
              console.log('unLockSeamlessWallet  rs-->', rs)
              if (rs?.code === 0) {
                changeSdkTradeMode(true)
                setUnlockAccountDialogOpen(false)
                // setTradeMode(TradeMode.Seamless)
              }
            }}
          >
            <Trans>Confirm</Trans>
          </PrimaryButton>
        </div>
        <p className="mt-[12px] text-center text-[12px] leading-[14px] text-[#848E9C]">
          <Trans>Forgot Password?</Trans>
          <span
            className="ml-[4px] cursor-pointer text-[#00E3A5]"
            onClick={() => {
              setSeamlessPasswordDialogOpen(true)
              setUnlockAccountDialogOpen(false)
            }}
          >
            <Trans>Recover or Reset immediately</Trans>
          </span>
        </p>
        <div className="mt-[24px] flex items-center justify-center gap-[12px]">
          <div className="h-[1px] flex-1 bg-[#31333D]"></div>
          <span className="text-[12px] leading-[14px] text-[#848E9C]">
            <Trans>OR</Trans>
          </span>
          <div className="h-[1px] flex-1 bg-[#31333D]"></div>
        </div>

        <div
          className="mt-[24px] flex cursor-pointer items-center justify-center rounded-[6px] border-[1px] border-[#3A404A] py-[20px]"
          onClick={() => {
            setLoginModalOpen(true)
            setTradeMode(TradeMode.Classic)
            setUnlockAccountDialogOpen(false)
          }}
        >
          <div className="flex items-center justify-center gap-[12px]">
            <WalletIcon size={16} color="white" />
            <span className="text-[14px] leading-[14px] font-[500] text-[#848E9C]">
              <Trans>Login In With Wallet</Trans>
            </span>
          </div>
        </div>
      </div>
    </DialogBase>
  )
}
