import { Trans } from '@lingui/react/macro'
import { useWalletStore } from '@/store/wallet/createStore'
import { LoginChannelEnum } from '@/store/wallet/types'
import { useWalletConnection } from '@/hooks/wallet/useWalletConnection'
import { useSocialLogin } from '@/hooks/social/useSocialLogin'
import type { AuthType } from '@particle-network/auth-core'

interface LoginItemProps {
  label: string
  icon: string
  isActive?: boolean
  isSingle?: boolean
  disabled?: boolean
  id: string
  channel: LoginChannelEnum
  connectorId?: string
  quickLogin?: boolean
  socialLoginType?: AuthType
}

export const LoginItem = ({
  label,
  icon,
  id,
  isSingle,
  disabled = false,
  channel,
  connectorId,
  quickLogin = false,
  socialLoginType,
}: LoginItemProps) => {
  const { recentLoginType } = useWalletStore()
  const { connectWallet } = useWalletConnection()
  const isRecent = recentLoginType === id
  const { socialLogin } = useSocialLogin()
  if (isSingle) {
    return (
      <div
        className="flex h-[44px] w-[44px] cursor-pointer items-center justify-center gap-[10px] rounded-[6px] border border-[#3A404A]"
        onClick={() => {
          if (channel === LoginChannelEnum.WALLET) {
            connectWallet({ id, connectorId: connectorId!, name: label })
          } else {
            socialLogin(socialLoginType!)
          }
        }}
      >
        <img src={icon} alt={label} className="h-[24px] w-[24px]" />
      </div>
    )
  }

  return (
    <div
      className={`mt-[8px] flex items-center justify-between gap-[10px] rounded-[6px] bg-[#202129] p-[12px] ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      style={{
        border: quickLogin ? '1px solid #3A404A' : 'none',
      }}
      onClick={
        disabled
          ? undefined
          : () => {
              if (channel === LoginChannelEnum.WALLET) {
                connectWallet({ id, connectorId: connectorId!, name: label })
              } else {
                socialLogin(id as AuthType)
              }
            }
      }
    >
      {quickLogin ? (
        <div className="flex w-full items-center justify-between gap-[10px]">
          <div className="flex items-center gap-[10px]">
            <img src={icon} alt={label} className="h-[24px] w-[24px]" />
            <p className="text-[14px] font-[700] text-[white]">{label}</p>
          </div>
          <p className="text-[14px] font-[500] text-[#00E3A5]">
            <Trans>Recent</Trans>
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-[10px]">
            <div className="flex h-[44px] w-[44px] items-center justify-center rounded-[6px] border border-[#3A404A]">
              <img src={icon} alt={label} className="h-[24px] w-[24px]" />
            </div>
            <p className="text-[14px] font-[700] text-[white]">{label}</p>
          </div>
          {isRecent && (
            <p className="text-[14px] font-[500] text-[#00E3A5]">
              <Trans>Recent</Trans>
            </p>
          )}
        </>
      )}
    </div>
  )
}
