import { VIPCard } from '@/pages/VIP/components/VipCard.tsx'
import { Upgrade } from './components/Upgrade'
import { VIPLevel } from '@/pages/VIP/components/VipList.tsx'
import { VIPProvider } from '@/pages/VIP/provider'
import { SecondHeader } from '@/components/SecondHeader'
import { Trans } from '@lingui/react/macro'

const VIP = () => {
  return (
    <VIPProvider>
      <VIPCard />
      <Upgrade />
      <VIPLevel />
    </VIPProvider>
  )
}

export default VIP
