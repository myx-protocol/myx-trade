import { VIPContext } from '@/pages/VIP/context.ts'
import type { ReactNode } from 'react'
import { useFetchLevelList, useFetchUserVipInfo } from '@/hooks/vip/useVipLevel.ts'
import Container from '@/components/Container.tsx'
import { VIPCard } from '@/pages/VIP/components/VipCard.tsx'
import { Upgrade } from '@/pages/VIP/components/Upgrade.tsx'
import { VIPLevel } from '@/pages/VIP/components/VipList.tsx'
import { SecondHeader } from '@/components/SecondHeader'
import { Trans } from '@lingui/react/macro'

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
      <SecondHeader title={<Trans>VIP</Trans>} />
      <div className={'flex flex-col overflow-x-hidden px-[16px] py-[24px]'}>{children}</div>
    </VIPContext.Provider>
  )
}
