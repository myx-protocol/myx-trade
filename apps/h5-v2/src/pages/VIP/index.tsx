import { VIPCard } from '@/pages/VIP/components/VipCard.tsx'
import { Upgrade } from './components/Upgrade'
import { VIPLevel } from '@/pages/VIP/components/VipList.tsx'
import { VIPProvider } from '@/pages/VIP/provider'
import { useEffect } from 'react'
import { t } from '@lingui/core/macro'

const VIP = () => {
  useEffect(() => {
    document.title = t`VIP - Exclusive Privileges & Fee Discounts | MYX`
  }, [])
  return (
    <VIPProvider>
      <VIPCard />
      <Upgrade />
      <VIPLevel />
    </VIPProvider>
  )
}

export default VIP
