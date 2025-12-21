import { VIPContext } from '@/pages/VIP/context.ts'
import type { ReactNode } from 'react'
import { useFetchLevelList, useFetchUserVipInfo } from '@/hooks/vip/useVipLevel.ts'
import Container from '@/components/Container.tsx'

export const VIPProvider = ({ children }: { children: ReactNode }) => {
  const { riskTier, setRiskTier, riskList, levelList, feeMap, isFeeLoading } = useFetchLevelList()
  const { userVipInfo, isLoading } = useFetchUserVipInfo()
  return (
    <VIPContext.Provider
      value={{
        riskTier,
        setRiskTier,
        riskList,
        levelList,
        userVipInfo,
        isLoading,
        feeMap,
        isFeeLoading,
      }}
    >
      <Container className={'flex min-h-[calc(100vh-66px-40px)] flex-col py-[20px]'}>
        {children}
      </Container>
    </VIPContext.Provider>
  )
}
