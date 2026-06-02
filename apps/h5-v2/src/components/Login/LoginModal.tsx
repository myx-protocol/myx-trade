import { DialogBase } from '../UI/DialogBase'
import { useWalletStore } from '@/store/wallet/createStore'
import { t } from '@lingui/core/macro'
import { LoginChannelEnum } from '@/store/wallet/types'
import { Trans } from '@lingui/react/macro'
import { ArrowRightIcon } from '../UI/Icon'
import { LoginItem } from './LoginItem'
import { walletList } from './constants'
import moreIcon from '@/assets/icon/more.svg'
import useGlobalStore from '@/store/globalStore'
import { useSeamlessStore } from '@/store/seamless/createStore'

const RenderRecentLogin = () => {
  const { recentLoginType } = useWalletStore()
  const recentWallet = walletList.find((item) => item.id === recentLoginType)

  if (recentWallet) {
    return (
      <>
        <LoginItem
          quickLogin
          label={recentWallet.name}
          icon={recentWallet.icon}
          id={recentWallet.id}
          connectorId={recentWallet.connectorId}
          channel={LoginChannelEnum.WALLET}
        />
        <div className="my-[32px] flex items-center gap-[10px]">
          <div className="h-[1px] flex-1 bg-[#3A404A]" />
          <span className="mx-[12px] text-[14px] font-[500] text-[#848E9C]">
            <Trans>Or Continue With </Trans>
          </span>
          <div className="h-[1px] flex-1 bg-[#3A404A]" />
        </div>
      </>
    )
  }

  return null
}

export const LoginModal = () => {
  const { loginModalOpen, setLoginModalOpen, setMoreLoginDrawerOpen } = useWalletStore()
  const { setSeamlessPasswordDialogOpen, setUnlockAccountDialogOpen } = useGlobalStore()
  const { seamlessAccountList } = useSeamlessStore()

  return (
    <DialogBase
      open={loginModalOpen}
      onClose={() => setLoginModalOpen(false)}
      title={t`Choose how to start`}
    >
      <div className="mt-[24px]">
        <RenderRecentLogin />
      </div>
      <div className="flex items-center justify-between">
        {walletList.slice(0, 4).map((item) => (
          <LoginItem
            key={item.id}
            label={item.name}
            icon={item.icon}
            id={item.id}
            channel={LoginChannelEnum.WALLET}
            isSingle
            connectorId={item.connectorId}
          />
        ))}
        <div
          className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center rounded-[6px] border border-[#3A404A]"
          onClick={() => {
            setMoreLoginDrawerOpen(true)
            setLoginModalOpen(false)
          }}
        >
          <img src={moreIcon} alt="more" className="h-[24px] w-[24px]" />
        </div>
      </div>
      <div
        className="mt-[32px] flex cursor-pointer items-center justify-center gap-[10px]"
        onClick={() => {
          setLoginModalOpen(false)
          if (seamlessAccountList.length === 0) {
            setSeamlessPasswordDialogOpen(true)
          } else {
            setUnlockAccountDialogOpen(true)
          }
        }}
      >
        <p className="text-[14px] font-[500] text-[#00E3A5]">
          <Trans>Continue With Seamless Account</Trans>
        </p>
        <ArrowRightIcon className="h-[16px] w-[16px]" color="#00E3A5" />
      </div>
    </DialogBase>
  )
}
