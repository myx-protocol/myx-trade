import { useWalletStore } from '@/store/wallet/createStore'
import { Drawer } from '../UI/Drawer'
import { walletList, socialList } from './constants'
import { Trans } from '@lingui/react/macro'
import BackIcon from '@/components/UI/Icon/BackIcon'
import { useState } from 'react'
import ArrowDownIcon from '@/components/UI/Icon/ArrowDownIcon'
import { LoginItem } from './LoginItem'
import { LoginChannelEnum } from '@/store/wallet/types'

export const MorePage = () => {
  const { moreLoginDrawerOpen, setMoreLoginDrawerOpen } = useWalletStore()
  const [showSocialLogin, setShowSocialLogin] = useState(true)
  const [showWalletLogin, setShowWalletLogin] = useState(true)

  return (
    <Drawer
      anchor="right"
      open={moreLoginDrawerOpen}
      onClose={() => setMoreLoginDrawerOpen(false)}
      title={
        <div className="flex w-full items-center gap-[10px] text-[16px] leading-[16px] font-[500] text-[white]">
          <div className="cursor-pointer">
            <BackIcon width={20} height={20} onClick={() => setMoreLoginDrawerOpen(false)} />
          </div>
          <Trans>More</Trans>
        </div>
      }
      sx={{
        width: '360px',
        borderTopLeftRadius: '16px',
        borderBottomLeftRadius: '16px',
      }}
    >
      <div className={`mt-[8px]`}>
        <div className="flex h-[40px] items-center justify-between">
          <p className="text-[14px] font-[700] text-[#848E9C]">
            <Trans>Social Login</Trans>
          </p>
          <div className="cursor-pointer">
            <ArrowDownIcon
              width={16}
              height={16}
              color="#848E9C"
              onClick={() => setShowSocialLogin(!showSocialLogin)}
            />
          </div>
        </div>
        {showSocialLogin &&
          socialList.map((item) => (
            <LoginItem
              key={item.type}
              label={item.name}
              id={item.id}
              icon={item.icon}
              channel={LoginChannelEnum.SOCIAL}
              socialLoginType={item.socialLoginType}
            />
          ))}
      </div>
      <div className={`mt-[8px]`}>
        <div className="flex h-[40px] items-center justify-between">
          <p className="text-[14px] font-[700] text-[#848E9C]">
            <Trans>Wallet</Trans>
          </p>
          <div className="cursor-pointer">
            <ArrowDownIcon
              width={16}
              height={16}
              color="#848E9C"
              onClick={() => setShowWalletLogin(!showWalletLogin)}
            />
          </div>
        </div>
        {showWalletLogin &&
          walletList.map((item) => (
            <LoginItem
              key={item.id}
              id={item.id}
              label={item.name}
              icon={item.icon}
              connectorId={item.connectorId}
              channel={LoginChannelEnum.WALLET}
            />
          ))}
      </div>
    </Drawer>
  )
}
