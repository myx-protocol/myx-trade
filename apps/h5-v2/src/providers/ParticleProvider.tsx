import { AuthType } from '@particle-network/auth-core'
import {
  arbitrum,
  arbitrumSepolia,
  linea,
  lineaSepolia,
  bsc,
  bscTestnet,
} from '@particle-network/authkit/chains'
import { getSupportedChainIdsByEnv } from '@/config/chain'
import { AuthCoreContextProvider, PromptSettingType } from '@particle-network/authkit'

import { PARTICLE_PROJECT_ID, PARTICLE_CLIENT_KEY, PARTICLE_APP_ID } from '@/constant/particle'

export const ParticleProvider = ({ children }: { children: React.ReactNode }) => {
  const chainConfig = [arbitrum, arbitrumSepolia, linea, lineaSepolia, bsc, bscTestnet]
  const supportedChainIds = getSupportedChainIdsByEnv()
  const chains = chainConfig.filter((item) => supportedChainIds.includes(item.id)) ?? []
  console.log(chains)
  return (
    <AuthCoreContextProvider
      options={{
        projectId: PARTICLE_PROJECT_ID,
        clientKey: PARTICLE_CLIENT_KEY,
        appId: PARTICLE_APP_ID,
        authTypes: [
          AuthType.email,
          AuthType.phone, // 添加手机号登录
          AuthType.google,
          AuthType.apple,
          AuthType.twitter,
          AuthType.discord,
          AuthType.facebook,
          AuthType.microsoft,
          AuthType.telegram,
        ],
        themeType: 'dark' as const,
        fiatCoin: 'USD' as const,
        language: 'en' as const,
        promptSettingConfig: {
          promptPaymentPasswordSettingWhenSign: PromptSettingType.first,
          promptMasterPasswordSettingWhenLogin: PromptSettingType.first,
        },
        wallet: {
          visible: false,
          customStyle: {},
        },

        chains: chains as any,
      }}
    >
      {children}
    </AuthCoreContextProvider>
  )
}
