import { Box } from '@mui/material'
import Container from '@/components/Container.tsx'
import { VIPCard } from '@/pages/VIP/components/VipCard.tsx'

const VIP = () => {
  return (
    <Container className={'flex min-h-[calc(100vh-66px-40px)] flex-col py-[20px]'}>
      <VIPCard />
      <Upgrade />
    </Container>
  )
}

export default VIP
