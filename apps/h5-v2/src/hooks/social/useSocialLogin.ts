import { useCallback } from 'react'
import { useConnect } from '@particle-network/authkit'
import { AuthType } from '@particle-network/auth-core'
import { useWalletStore } from '@/store/wallet/createStore'
import { RecentLoginTypeEnum } from '@/store/wallet/types'

export const useSocialLogin = () => {
  const { connect } = useConnect()
  const { setRecentLoginType } = useWalletStore()

  const socialLogin = useCallback(
    async (socialLoginType: AuthType) => {
      if (socialLoginType === AuthType.email) {
        setRecentLoginType(RecentLoginTypeEnum.Email)
        return
      }
      await connect({ socialType: socialLoginType } as any)
    },
    [connect, setRecentLoginType],
  )

  return {
    socialLogin,
  }
}
