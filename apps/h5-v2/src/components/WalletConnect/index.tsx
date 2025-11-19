import { useWalletStore } from '@/store/wallet/createStore'
import { Trans } from '@lingui/react/macro'
import { PrimaryButton } from '../UI/Button'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import WalletIcon from '../UI/Icon/WalletIcon'
import { encryptionAddress } from '@/utils'
import ArrowDownIconFill from '../UI/Icon/ArrowDownIconFill'
import { useState, useEffect } from 'react'
import { HoverCard } from '../UI/HoverCard'
import ArrowRight from '../UI/Icon/ArrowRight'
import AccountModeIcon from '../UI/Icon/AccountMode'
import CopyIcon from '../UI/Icon/CopyIcon'
import LogoutIcon from '../UI/Icon/LogoutIcon'

export const WalletConnect = () => {
  const { activeAddress, setLoginModalOpen } = useWalletStore()
  const { disconnect } = useWalletConnection()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [activeAddress])

  if (activeAddress) {
    return (
      <HoverCard
        open={isOpen}
        placement="bottom-start"
        trigger={
          <div
            className="flex cursor-pointer items-center gap-[10px] rounded-[6px] bg-[#18191F] p-[8px]"
            onClick={() => setIsOpen(!isOpen)}
          >
            <WalletIcon />
            <span className="text-[14px] font-[500] text-[white]">
              {encryptionAddress(activeAddress)}
            </span>
            <ArrowDownIconFill color="#848E9C" width={12} height={12} />
          </div>
        }
      >
        <div className="flex w-[260px] flex-col">
          <div className="flex cursor-pointer items-center justify-between rounded-[6px] bg-[#18191F] p-[8px] p-[16px] text-[12px] text-white hover:bg-[#202129]">
            <div className="flex items-center gap-[8px]">
              <AccountModeIcon width={12} height={12} />
              <span>
                <Trans>Account Mode</Trans>
              </span>
            </div>
            <div className="flex items-center gap-[4px]">
              <span className="text-[12px] font-[500] text-[#848E9C]">
                <Trans>Classic</Trans>
              </span>
              <ArrowRight color="#848E9C" width={7} height={11} />
            </div>
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-[6px] bg-[#18191F] p-[8px] p-[16px] text-[12px] text-white hover:bg-[#202129]">
            <div className="flex items-center gap-[8px]">
              <CopyIcon width={14} height={14} />
              <span>
                <Trans>Address</Trans>
                {encryptionAddress(activeAddress)}
              </span>
            </div>
            <span
              className="cursor-pointer text-[12px] font-[500] text-[#00E3A5]"
              onClick={() => {}}
            >
              <Trans>Copy</Trans>
            </span>
          </div>
          <div
            className="flex cursor-pointer items-center gap-[8px] rounded-[6px] bg-[#18191F] p-[8px] p-[16px] text-[12px] text-white hover:bg-[#202129]"
            onClick={() => disconnect()}
          >
            <LogoutIcon color={'#FF4D4F'} width={14} height={14} />
            <span className="text-[12px] font-[500] text-[#FF4D4F]">
              <Trans>Log Out</Trans>
            </span>
          </div>
        </div>
      </HoverCard>
    )
  }

  return (
    <PrimaryButton
      simple
      onClick={() => {
        setLoginModalOpen(true)
      }}
    >
      <Trans>Connect Wallet</Trans>
    </PrimaryButton>
  )
}
