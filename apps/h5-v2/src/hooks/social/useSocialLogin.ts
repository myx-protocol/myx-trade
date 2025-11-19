import { useCallback } from 'react'
import { useConnect } from '@particle-network/authkit'
import { AuthType } from '@particle-network/auth-core'

export const useSocialLogin = () => {
  const { connect } = useConnect()
  const socialLogin = useCallback(
    async (socialLoginType: AuthType) => {
      if (socialLoginType !== AuthType.email) {
        await connect({ socialType: socialLoginType } as any)
      }
    },
    [connect],
  )

  return {
    socialLogin,
  }
}
